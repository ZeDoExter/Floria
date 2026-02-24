# Tiltfile for Floria Project

docker_compose("docker-compose.yml")

# Config live updates for all Node/Bun projects
def create_node_build(service_name, path):
    docker_build(
        service_name,
        context=path,
        live_update=[
            sync(path + "/src", "/usr/src/app/src"),
            sync(path + "/package.json", "/usr/src/app/package.json"),
            run("bun run build", trigger=["./src", "./package.json"])
        ]
    )


create_node_build("inventory-service", "./backend/inventory-service")
create_node_build("cart-service", "./backend/cart-service")
create_node_build("order-service", "./backend/order-service")
create_node_build("payment-service", "./backend/payment-service")
create_node_build("gateway", "./backend/gateway")

docker_build(
    "frontend",
    context="./frontend",
    live_update=[
        sync("./frontend/src", "/usr/src/app/src"),
        sync("./frontend/static", "/usr/src/app/static"),
        sync("./frontend/package.json", "/usr/src/app/package.json"),
        # depending on builder (vite/sveltekit)
        run("bun run build || npm run build", trigger=["./src", "./package.json"])
    ]
)
