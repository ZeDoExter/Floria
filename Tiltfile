# Tiltfile
docker_compose("docker-compose.yml")

# Config build constraints and dependencies for all Node projects
# Since we updated to multi-stage production Dockerfiles (node:20-alpine),
# the final image does not have devDependencies needed for 'live_update' compilation.
# Tilt will use fast Docker layer caching to rebuild the containers on file changes.

def configure_node_service(service_name, path):
    docker_build(
        service_name,
        context=".",
        dockerfile=path + "/Dockerfile",
        ignore=["**/node_modules", "**/.git", "**/dist"]
    )

configure_node_service("cart-service", "./backend/cart-service")
configure_node_service("order-service", "./backend/order-service")
configure_node_service("payment-service", "./backend/payment-service")
configure_node_service("gateway", "./backend/gateway")

docker_build(
    "frontend",
    context="./frontend",
    dockerfile="./frontend/Dockerfile",
    ignore=["**/node_modules", "**/.git", "**/dist"]
)
