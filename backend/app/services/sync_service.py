from datetime import datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Exercise, WorkoutEntry, WorkoutPlan
from app.models.exercise import MuscleGroup
from app.schemas.sync import SyncConflict


class SyncService:
    """Service for handling offline-first sync with conflict resolution."""

    def __init__(self, db: AsyncSession, user_id: str, device_id: str):
        self.db = db
        self.user_id = user_id
        self.device_id = device_id

    async def sync_exercises(
        self,
        client_exercises: list[dict[str, Any]],
        last_sync_at: datetime | None,
    ) -> tuple[list[dict[str, Any]], list[SyncConflict]]:
        """Sync exercises between client and server."""
        conflicts: list[SyncConflict] = []

        # Get all user's exercises (including deleted for sync)
        query = select(Exercise).where(Exercise.user_id == self.user_id)
        if last_sync_at:
            query = query.where(Exercise.updated_at >= last_sync_at)
        result = await self.db.execute(query)
        server_exercises = {e.id: e for e in result.scalars().all()}

        # Process client changes
        for client_ex in client_exercises:
            entity_id = client_ex.get("id")
            if not entity_id:
                continue

            client_version = client_ex.get("version", 1)

            if entity_id in server_exercises:
                server_ex = server_exercises[entity_id]

                # Conflict detection
                if server_ex.version > client_version:
                    # Server wins - client has stale data
                    conflicts.append(
                        SyncConflict(
                            entity_type="exercise",
                            entity_id=entity_id,
                            resolution="server_wins",
                            server_version=server_ex.version,
                            client_version=client_version,
                        )
                    )
                elif server_ex.version == client_version:
                    # Same version - use timestamp as tiebreaker
                    client_updated = client_ex.get("updated_at")
                    if client_updated:
                        client_dt = (
                            datetime.fromisoformat(client_updated.replace("Z", "+00:00"))
                            if isinstance(client_updated, str)
                            else client_updated
                        )
                        if server_ex.updated_at > client_dt:
                            conflicts.append(
                                SyncConflict(
                                    entity_type="exercise",
                                    entity_id=entity_id,
                                    resolution="server_wins",
                                    server_version=server_ex.version,
                                    client_version=client_version,
                                )
                            )
                            continue

                    # Client wins - apply changes
                    await self._apply_exercise_changes(server_ex, client_ex)
                else:
                    # Client has newer version - apply changes
                    await self._apply_exercise_changes(server_ex, client_ex)
            else:
                # New exercise from client
                await self._create_exercise(client_ex)

        await self.db.commit()

        # Return all exercises updated since last sync
        query = select(Exercise).where(Exercise.user_id == self.user_id)
        result = await self.db.execute(query)
        all_exercises = [self._exercise_to_dict(e) for e in result.scalars().all()]

        return all_exercises, conflicts

    async def sync_workout_plans(
        self,
        client_plans: list[dict[str, Any]],
        last_sync_at: datetime | None,
    ) -> tuple[list[dict[str, Any]], list[SyncConflict]]:
        """Sync workout plans between client and server."""
        conflicts: list[SyncConflict] = []

        query = select(WorkoutPlan).where(WorkoutPlan.user_id == self.user_id)
        if last_sync_at:
            query = query.where(WorkoutPlan.updated_at >= last_sync_at)
        result = await self.db.execute(query)
        server_plans = {p.id: p for p in result.scalars().all()}

        for client_plan in client_plans:
            entity_id = client_plan.get("id")
            if not entity_id:
                continue

            client_version = client_plan.get("version", 1)

            if entity_id in server_plans:
                server_plan = server_plans[entity_id]

                if server_plan.version > client_version:
                    conflicts.append(
                        SyncConflict(
                            entity_type="workout_plan",
                            entity_id=entity_id,
                            resolution="server_wins",
                            server_version=server_plan.version,
                            client_version=client_version,
                        )
                    )
                else:
                    await self._apply_plan_changes(server_plan, client_plan)
            else:
                await self._create_plan(client_plan)

        await self.db.commit()

        query = select(WorkoutPlan).where(WorkoutPlan.user_id == self.user_id)
        result = await self.db.execute(query)
        all_plans = [self._plan_to_dict(p) for p in result.scalars().all()]

        return all_plans, conflicts

    async def sync_workout_entries(
        self,
        client_entries: list[dict[str, Any]],
        last_sync_at: datetime | None,
    ) -> tuple[list[dict[str, Any]], list[SyncConflict]]:
        """Sync workout entries between client and server."""
        conflicts: list[SyncConflict] = []

        query = select(WorkoutEntry).where(WorkoutEntry.user_id == self.user_id)
        if last_sync_at:
            query = query.where(WorkoutEntry.updated_at >= last_sync_at)
        result = await self.db.execute(query)
        server_entries = {e.id: e for e in result.scalars().all()}

        for client_entry in client_entries:
            entity_id = client_entry.get("id")
            if not entity_id:
                continue

            client_version = client_entry.get("version", 1)

            if entity_id in server_entries:
                server_entry = server_entries[entity_id]

                if server_entry.version > client_version:
                    conflicts.append(
                        SyncConflict(
                            entity_type="workout_entry",
                            entity_id=entity_id,
                            resolution="server_wins",
                            server_version=server_entry.version,
                            client_version=client_version,
                        )
                    )
                else:
                    await self._apply_entry_changes(server_entry, client_entry)
            else:
                await self._create_entry(client_entry)

        await self.db.commit()

        query = select(WorkoutEntry).where(WorkoutEntry.user_id == self.user_id)
        result = await self.db.execute(query)
        all_entries = [self._entry_to_dict(e) for e in result.scalars().all()]

        return all_entries, conflicts

    # Helper methods for applying changes
    async def _apply_exercise_changes(self, exercise: Exercise, data: dict[str, Any]) -> None:
        exercise.name = data.get("name", exercise.name)
        muscle_group = data.get("muscle_group") or data.get("muscleGroup")
        if muscle_group:
            exercise.muscle_group = MuscleGroup(muscle_group)
        exercise.equipment = data.get("equipment", exercise.equipment)
        exercise.notes = data.get("notes")
        exercise.personal_best = data.get("personal_best") or data.get("personalBest")
        exercise.is_deleted = data.get("is_deleted") or data.get("isDeleted", False)
        if exercise.is_deleted:
            exercise.deleted_at = datetime.utcnow()
        exercise.version += 1
        exercise.updated_at = datetime.utcnow()
        exercise.last_modified_by_device = self.device_id

    async def _create_exercise(self, data: dict[str, Any]) -> None:
        muscle_group = data.get("muscle_group") or data.get("muscleGroup", "Full Body")
        exercise = Exercise(
            id=data["id"],
            user_id=self.user_id,
            name=data.get("name", ""),
            muscle_group=MuscleGroup(muscle_group),
            equipment=data.get("equipment", ""),
            notes=data.get("notes"),
            personal_best=data.get("personal_best") or data.get("personalBest"),
            is_deleted=data.get("is_deleted") or data.get("isDeleted", False),
            version=data.get("version", 1),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            last_modified_by_device=self.device_id,
        )
        self.db.add(exercise)

    async def _apply_plan_changes(self, plan: WorkoutPlan, data: dict[str, Any]) -> None:
        date_str = data.get("date")
        if date_str:
            from datetime import date as date_type

            if isinstance(date_str, str):
                plan.date = date_type.fromisoformat(date_str[:10])
            else:
                plan.date = date_str
        plan.title = data.get("title", plan.title)
        plan.tags = data.get("tags", plan.tags)
        plan.exercises = data.get("exercises", plan.exercises)
        plan.is_completed = data.get("is_completed") or data.get("isCompleted", False)
        plan.is_deleted = data.get("is_deleted") or data.get("isDeleted", False)
        if plan.is_deleted:
            plan.deleted_at = datetime.utcnow()
        plan.version += 1
        plan.updated_at = datetime.utcnow()
        plan.last_modified_by_device = self.device_id

    async def _create_plan(self, data: dict[str, Any]) -> None:
        from datetime import date as date_type

        date_str = data.get("date", "")
        plan_date = date_type.fromisoformat(date_str[:10]) if date_str else date_type.today()

        plan = WorkoutPlan(
            id=data["id"],
            user_id=self.user_id,
            date=plan_date,
            title=data.get("title", ""),
            tags=data.get("tags", []),
            exercises=data.get("exercises", []),
            is_completed=data.get("is_completed") or data.get("isCompleted", False),
            is_deleted=data.get("is_deleted") or data.get("isDeleted", False),
            version=data.get("version", 1),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            last_modified_by_device=self.device_id,
        )
        self.db.add(plan)

    async def _apply_entry_changes(self, entry: WorkoutEntry, data: dict[str, Any]) -> None:
        date_str = data.get("date")
        if date_str:
            from datetime import date as date_type

            if isinstance(date_str, str):
                entry.date = date_type.fromisoformat(date_str[:10])
            else:
                entry.date = date_str
        entry.exercise_id = data.get("exercise_id") or data.get("exerciseId", entry.exercise_id)
        entry.workout_type = data.get("workout_type") or data.get("workoutType", entry.workout_type)
        entry.sets = data.get("sets", entry.sets)
        entry.plan_id = data.get("plan_id") or data.get("planId")
        entry.is_deleted = data.get("is_deleted") or data.get("isDeleted", False)
        if entry.is_deleted:
            entry.deleted_at = datetime.utcnow()
        entry.version += 1
        entry.updated_at = datetime.utcnow()
        entry.last_modified_by_device = self.device_id

    async def _create_entry(self, data: dict[str, Any]) -> None:
        from datetime import date as date_type

        date_str = data.get("date", "")
        entry_date = date_type.fromisoformat(date_str[:10]) if date_str else date_type.today()

        entry = WorkoutEntry(
            id=data["id"],
            user_id=self.user_id,
            date=entry_date,
            exercise_id=data.get("exercise_id") or data.get("exerciseId", ""),
            workout_type=data.get("workout_type") or data.get("workoutType", ""),
            sets=data.get("sets", []),
            plan_id=data.get("plan_id") or data.get("planId"),
            is_deleted=data.get("is_deleted") or data.get("isDeleted", False),
            version=data.get("version", 1),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            last_modified_by_device=self.device_id,
        )
        self.db.add(entry)

    # Serialization helpers
    def _exercise_to_dict(self, exercise: Exercise) -> dict[str, Any]:
        return {
            "id": exercise.id,
            "name": exercise.name,
            "muscleGroup": exercise.muscle_group.value,
            "equipment": exercise.equipment,
            "notes": exercise.notes,
            "personalBest": exercise.personal_best,
            "version": exercise.version,
            "updatedAt": exercise.updated_at.isoformat() if exercise.updated_at else None,
            "createdAt": exercise.created_at.isoformat() if exercise.created_at else None,
            "isDeleted": exercise.is_deleted,
        }

    def _plan_to_dict(self, plan: WorkoutPlan) -> dict[str, Any]:
        return {
            "id": plan.id,
            "date": plan.date.isoformat() if plan.date else None,
            "title": plan.title,
            "tags": plan.tags or [],
            "exercises": plan.exercises or [],
            "isCompleted": plan.is_completed,
            "version": plan.version,
            "updatedAt": plan.updated_at.isoformat() if plan.updated_at else None,
            "createdAt": plan.created_at.isoformat() if plan.created_at else None,
            "isDeleted": plan.is_deleted,
        }

    def _entry_to_dict(self, entry: WorkoutEntry) -> dict[str, Any]:
        return {
            "id": entry.id,
            "date": entry.date.isoformat() if entry.date else None,
            "exerciseId": entry.exercise_id,
            "workoutType": entry.workout_type,
            "sets": entry.sets or [],
            "planId": entry.plan_id,
            "version": entry.version,
            "updatedAt": entry.updated_at.isoformat() if entry.updated_at else None,
            "createdAt": entry.created_at.isoformat() if entry.created_at else None,
            "isDeleted": entry.is_deleted,
        }
