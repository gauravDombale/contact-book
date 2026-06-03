from typing import Optional
import uuid

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Contact
from app.schemas import ContactCreate, ContactUpdate, MergeRequest


async def create_contact(db: AsyncSession, data: ContactCreate) -> Contact:
    contact = Contact(id=str(uuid.uuid4()), **data.model_dump())
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    return contact


async def get_contact(db: AsyncSession, contact_id: str) -> Optional[Contact]:
    result = await db.execute(select(Contact).where(Contact.id == contact_id))
    return result.scalar_one_or_none()


async def list_contacts(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Contact]:
    stmt = (
        select(Contact)
        .order_by(Contact.first_name, Contact.last_name)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def search_contacts(db: AsyncSession, q: str) -> list[Contact]:
    term = f"%{q}%"
    stmt = (
        select(Contact)
        .where(
            or_(
                (Contact.first_name + " " + Contact.last_name).ilike(term),
                Contact.email.ilike(term),
                Contact.phone.ilike(term),
            )
        )
        .order_by(Contact.first_name, Contact.last_name)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_contact(
    db: AsyncSession, contact_id: str, data: ContactUpdate
) -> Optional[Contact]:
    contact = await get_contact(db, contact_id)
    if not contact:
        return None

    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "last_name" and value is None:
            value = ""
        setattr(contact, field, value)

    await db.commit()
    await db.refresh(contact)
    return contact


async def delete_contact(db: AsyncSession, contact_id: str) -> bool:
    contact = await get_contact(db, contact_id)
    if not contact:
        return False

    await db.delete(contact)
    await db.commit()
    return True


async def merge_contacts(db: AsyncSession, req: MergeRequest) -> Optional[Contact]:
    if req.source_id == req.target_id:
        return None

    source = await get_contact(db, req.source_id)
    target = await get_contact(db, req.target_id)
    if not source or not target:
        return None

    fields = ["first_name", "last_name", "email", "phone", "address", "company", "notes"]
    for field in fields:
        src_val = getattr(source, field)
        tgt_val = getattr(target, field)
        if not tgt_val and src_val:
            setattr(target, field, src_val)

    if req.overrides:
        for field, value in req.overrides.model_dump(exclude_unset=True).items():
            if field == "last_name" and value is None:
                value = ""
            setattr(target, field, value)

    await db.delete(source)
    await db.commit()
    await db.refresh(target)
    return target
