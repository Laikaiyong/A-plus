FROM python:3.13-slim

WORKDIR /app

# Install PostgreSQL development dependencies
RUN apt-get update && apt-get install -y \
    postgresql-server-dev-all \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8090

# Run the application
CMD ["python", "main.py"]