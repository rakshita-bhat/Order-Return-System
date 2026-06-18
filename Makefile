.PHONY: all run db-create db-drop backend-install backend-compile backend-build backend-clean \
        backend-run backend-stop backend-restart frontend-install frontend-run frontend-build \
        frontend-clean build clean

all: backend-build frontend-build

# ─── Database ────────────────────────────────────────────────

db-create:
	@echo "Creating 'returnsystem' database…"
	@psql -U postgres -d postgres -c "CREATE DATABASE returnsystem;" 2>/dev/null || echo "Database already exists"

db-drop:
	@echo "Dropping 'returnsystem' database…"
	@psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS returnsystem;"

# ─── Backend ─────────────────────────────────────────────────

backend-install:
	@echo "Installing backend dependencies…"
	@cd backend && mvn dependency:resolve -q

backend-compile:
	@echo "Compiling backend…"
	@cd backend && mvn compile -q

backend-build:
	@echo "Building backend…"
	@cd backend && mvn package -DskipTests -q

backend-clean:
	@echo "Cleaning backend artifacts…"
	@cd backend && mvn clean -q

backend-run: db-create backend-compile
	@echo "Starting backend on http://localhost:8080…"
	@cd backend && mvn spring-boot:run -q

backend-stop:
	@-kill $$(lsof -t -i :8080) 2>/dev/null && echo "Backend stopped" || echo "Not running"

backend-restart: backend-stop backend-run

# ─── Frontend ────────────────────────────────────────────────

frontend-install:
	@echo "Installing frontend dependencies…"
	@cd frontend && npm install --silent

frontend-run: frontend-install
	@echo "Starting frontend on http://localhost:5173…"
	@cd frontend && npm run dev

frontend-build:
	@echo "Building frontend for production…"
	@cd frontend && npm run build

frontend-clean:
	@echo "Cleaning frontend artifacts…"
	@rm -rf frontend/dist frontend/node_modules

# ─── Combined ────────────────────────────────────────────────

build: backend-build frontend-build

run: backend-stop
	@$(MAKE) db-create
	@echo "Starting backend in background, then frontend…"
	@cd backend && mvn spring-boot:run -q &
	@sleep 8
	@$(MAKE) frontend-run

clean: backend-clean
	@rm -rf frontend/dist
	@echo "Cleaned."
