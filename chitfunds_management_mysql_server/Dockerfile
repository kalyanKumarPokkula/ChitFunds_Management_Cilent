# Base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install MySQL client
RUN apt-get update && \
    apt-get install -y default-libmysqlclient-dev gcc && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the rest of the application
COPY . .

ENV PYTHONUNBUFFERED=1
ENV DB_HOST=mysql
ENV DB_USER=root
ENV DB_PASSWORD=chitfunds_password
ENV DB_NAME=chitfunds
ENV DB_PORT=3306

# Expose port
EXPOSE 5000

# Start the application
CMD ["python", "run.py"] 