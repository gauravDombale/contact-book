from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.database import get_db
from app.schemas import ContactCreate, ContactOut, ContactUpdate, MergeRequest


router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.post("/", response_model=ContactOut, status_code=201)
async def create(body: ContactCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_contact(db, body)


@router.get("/", response_model=list[ContactOut])
async def list_all(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    return await crud.list_contacts(db, skip, limit)


@router.get("/search", response_model=list[ContactOut])
async def search(q: str = Query(..., min_length=1), db: AsyncSession = Depends(get_db)):
    return await crud.search_contacts(db, q)


@router.post("/merge", response_model=ContactOut)
async def merge(body: MergeRequest, db: AsyncSession = Depends(get_db)):
    contact = await crud.merge_contacts(db, body)
    if not contact:
        raise HTTPException(404, "One or both contacts not found")
    return contact


@router.get("/{contact_id}", response_model=ContactOut)
async def get_one(contact_id: str, db: AsyncSession = Depends(get_db)):
    contact = await crud.get_contact(db, contact_id)
    if not contact:
        raise HTTPException(404, "Contact not found")
    return contact


@router.put("/{contact_id}", response_model=ContactOut)
async def update(
    contact_id: str, body: ContactUpdate, db: AsyncSession = Depends(get_db)
):
    contact = await crud.update_contact(db, contact_id, body)
    if not contact:
        raise HTTPException(404, "Contact not found")
    return contact


@router.delete("/{contact_id}", status_code=204)
async def delete(contact_id: str, db: AsyncSession = Depends(get_db)):
    ok = await crud.delete_contact(db, contact_id)
    if not ok:
        raise HTTPException(404, "Contact not found")
