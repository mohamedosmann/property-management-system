async function main() {
    try {
        const res = await fetch("http://localhost:3000/api/seed");
        const data = await res.json();
        console.log("Admin ID:", data.admin.id);
    } catch (e) {
        console.error(e);
    }
}
main();
