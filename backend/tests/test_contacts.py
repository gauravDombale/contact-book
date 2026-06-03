import pytest


pytestmark = pytest.mark.asyncio

BASE = "/api/v1/contacts"


async def test_create_contact(client):
    response = await client.post(
        BASE + "/",
        json={
            "first_name": "Alice",
            "email": "alice@example.com",
            "phone": "9999999999",
        },
    )

    assert response.status_code == 201
    assert response.json()["first_name"] == "Alice"


async def test_invalid_email_rejected(client):
    response = await client.post(
        BASE + "/",
        json={"first_name": "Alice", "email": "not-an-email"},
    )

    assert response.status_code == 422


async def test_phone_is_normalized(client):
    response = await client.post(
        BASE + "/",
        json={"first_name": "Isha", "phone": "+91 98765-43210"},
    )

    assert response.status_code == 201
    assert response.json()["phone"] == "919876543210"


async def test_blank_optional_fields_become_null(client):
    response = await client.post(
        BASE + "/",
        json={"first_name": "Nora", "email": "", "phone": "   ", "company": "   "},
    )

    assert response.status_code == 201
    assert response.json()["email"] is None
    assert response.json()["phone"] is None
    assert response.json()["company"] is None


async def test_list_contacts(client):
    await client.post(BASE + "/", json={"first_name": "Bob"})
    response = await client.get(BASE + "/")

    assert response.status_code == 200
    assert len(response.json()) >= 1


async def test_search_by_name(client):
    await client.post(BASE + "/", json={"first_name": "Charlie", "last_name": "Brown"})
    response = await client.get(BASE + "/search?q=charlie")

    assert response.status_code == 200
    assert any(contact["first_name"] == "Charlie" for contact in response.json())


async def test_search_by_email(client):
    await client.post(BASE + "/", json={"first_name": "Diana", "email": "diana@test.com"})
    response = await client.get(BASE + "/search?q=diana@test.com")

    assert response.status_code == 200
    assert any(contact["email"] == "diana@test.com" for contact in response.json())


async def test_search_by_phone(client):
    await client.post(BASE + "/", json={"first_name": "Eve", "phone": "8888888888"})
    response = await client.get(BASE + "/search?q=8888888888")

    assert response.status_code == 200
    assert any(contact["phone"] == "8888888888" for contact in response.json())


async def test_search_by_formatted_phone(client):
    await client.post(BASE + "/", json={"first_name": "Eva", "phone": "+1 (888) 555-0101"})
    response = await client.get(BASE + "/search?q=(888) 555")

    assert response.status_code == 200
    assert any(contact["phone"] == "18885550101" for contact in response.json())


async def test_update_contact(client):
    response = await client.post(BASE + "/", json={"first_name": "Frank"})
    contact_id = response.json()["id"]
    updated = await client.put(BASE + f"/{contact_id}", json={"first_name": "Franklin"})

    assert updated.status_code == 200
    assert updated.json()["first_name"] == "Franklin"


async def test_delete_contact(client):
    response = await client.post(BASE + "/", json={"first_name": "Grace"})
    contact_id = response.json()["id"]
    deleted = await client.delete(BASE + f"/{contact_id}")
    fetched = await client.get(BASE + f"/{contact_id}")

    assert deleted.status_code == 204
    assert fetched.status_code == 404


async def test_merge_contacts(client):
    source = await client.post(BASE + "/", json={"first_name": "Hal", "email": "hal@x.com"})
    target = await client.post(BASE + "/", json={"first_name": "Hal", "phone": "7777777777"})
    source_id = source.json()["id"]
    target_id = target.json()["id"]

    response = await client.post(
        BASE + "/merge", json={"source_id": source_id, "target_id": target_id}
    )
    merged = response.json()
    fetched_source = await client.get(BASE + f"/{source_id}")

    assert response.status_code == 200
    assert merged["email"] == "hal@x.com"
    assert merged["phone"] == "7777777777"
    assert fetched_source.status_code == 404


async def test_merge_rejects_same_source_and_target(client):
    response = await client.post(BASE + "/", json={"first_name": "June"})
    contact_id = response.json()["id"]

    merged = await client.post(
        BASE + "/merge", json={"source_id": contact_id, "target_id": contact_id}
    )

    assert merged.status_code == 400
    assert merged.json()["detail"] == "source_id and target_id must be different"


async def test_merge_applies_overrides(client):
    source = await client.post(
        BASE + "/",
        json={"first_name": "Kai", "email": "kai.source@example.com", "phone": "111"},
    )
    target = await client.post(
        BASE + "/",
        json={"first_name": "Kai", "email": "kai.target@example.com", "phone": "222"},
    )

    response = await client.post(
        BASE + "/merge",
        json={
            "source_id": source.json()["id"],
            "target_id": target.json()["id"],
            "overrides": {"email": "kai.final@example.com"},
        },
    )

    assert response.status_code == 200
    assert response.json()["email"] == "kai.final@example.com"
    assert response.json()["phone"] == "222"


async def test_blank_first_name_rejected(client):
    response = await client.post(BASE + "/", json={"first_name": "   "})

    assert response.status_code == 422
