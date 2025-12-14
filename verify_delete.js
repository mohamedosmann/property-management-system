const fs = require('fs');

async function main() {
    try {
        // 1. Get Admin ID
        const adminId = "cmj087rix0000w60oztb543g6";
        console.log("Admin ID:", adminId);

        // 2. Create Property
        console.log("Creating property...");
        const createRes = await fetch("http://localhost:3000/api/properties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "Test Delete Prop",
                description: "To be deleted",
                location: "Nowhere",
                price: 1000,
                type: "House",
                bedrooms: 2,
                bathrooms: 1,
                squareFeet: 500,
                ownerId: adminId,
                images: []
            })
        });

        if (!createRes.ok) {
            throw new Error("Create failed: " + await createRes.text());
        }

        const property = await createRes.json();
        console.log("Property Created:", property.id);

        // 3. Delete Property
        console.log("Deleting property...");
        const deleteRes = await fetch(`http://localhost:3000/api/properties/${property.id}`, {
            method: "DELETE"
        });

        if (!deleteRes.ok) {
            const txt = await deleteRes.text();
            throw new Error("Delete failed: " + txt);
        }

        const deleted = await deleteRes.json();
        console.log("Property Deleted:", deleted.id);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
