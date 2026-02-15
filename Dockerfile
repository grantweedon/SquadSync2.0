# Use an official Python runtime as a parent image
# python:3.10-slim is a good balance of size and stability for production
FROM python:3.10-slim

# Set environment variables
# PYTHONDONTWRITEBYTECODE: Prevents Python from writing pyc files to disc
# PYTHONUNBUFFERED: Prevents Python from buffering stdout and stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies if required (e.g., for building Python wheels)
# Uncomment the following lines if you have dependencies like psycopg2 (Postgres)
# RUN apt-get update && apt-get install -y \
#     gcc \
#     libpq-dev \
#     && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# We upgrade pip first to avoid legacy install issues
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install gunicorn

# Copy the rest of the application code to the working directory
COPY . .

# Create a non-root user for security purposes
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# Expose port 8000 to the outside world
EXPOSE 8080

# Run the application using Gunicorn
# -w 4: Uses 4 worker processes (adjust based on CPU cores: 2 * cores + 1)
# -b 0.0.0.0:8000: Binds to all interfaces on port 8000
# main:app: Looks for the 'app' object in 'main.py'
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "main:app"]
