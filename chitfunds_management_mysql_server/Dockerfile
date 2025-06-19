# # Base image
# FROM python:3.11-slim

# # Set working directory
# WORKDIR /app

# # Copy requirements file
# COPY requirements.txt .

# # Install dependencies
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy the rest of the application
# COPY . .

# # Expose port
# EXPOSE 5001

# # Start the application
# CMD ["python", "main.py"] 


# FROM python:3.11-slim

# WORKDIR /app

# RUN apt-get update && \
#     apt-get install -y --no-install-recommends \
#     default-mysql-client \
#     gcc \
#     curl \
#     sed \
#     && rm -rf /var/lib/apt/lists/*

# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# COPY . .

# # 🔧 Clean line endings inside the container
# RUN chmod +x backup_to_s3.sh
# RUN chmod +x restore_from_backup.sh
# RUN sed -i 's/\r$//' restore_from_backup.sh && \
#     sed -i 's/\r$//' .env

# RUN sed -i 's/\r$//' backup_to_s3.sh && \
#     sed -i 's/\r$//' .env

# EXPOSE 5001

# CMD ["python", "main.py"]

# FROM python:3.11-slim

# WORKDIR /app

# # Install required tools
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     dos2unix curl default-mysql-client \
#     && rm -rf /var/lib/apt/lists/*

# # Copy your shell scripts and fix line endings
# COPY backup_to_s3.sh restore_from_backup.sh ./
# COPY .env ./
# RUN dos2unix .env
# RUN dos2unix backup_to_s3.sh restore_from_backup.sh \
#  && chmod +x backup_to_s3.sh restore_from_backup.sh

# # Copy the rest of the application
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# COPY . .

# EXPOSE 5001

# CMD ["python", "main.py"]


FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    dos2unix curl default-mysql-client \
    && rm -rf /var/lib/apt/lists/*


COPY backup_to_s3.sh restore_from_backup.sh .env ./

# Convert all scripts and .env to Unix format before making executable
RUN dos2unix backup_to_s3.sh restore_from_backup.sh .env \
 && chmod +x backup_to_s3.sh restore_from_backup.sh

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

CMD ["python", "main.py"]

