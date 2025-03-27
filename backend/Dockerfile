# Use official Python image
FROM python:3.11

# Set working directory
WORKDIR /app

# Copy project files
COPY . /app

# Install some bits that let us add the clang package repository
RUN apt-get update -qqy && \
    apt-get install -qy \
        wget \
        gnupg

# Install the key and source location for the clang package repository
RUN wget -O - https://apt.llvm.org/llvm-snapshot.gpg.key | apt-key add -
RUN echo 'deb http://apt.llvm.org/bullseye/ llvm-toolchain-bullseye main' >> /etc/apt/sources.list

RUN apt-get update -qqy && \
    apt-get install -qy \
        clang-format clang-tidy clang-tools clang clangd libc++-dev libc++1 libc++abi-dev libc++abi1 libclang-dev libclang1 liblldb-dev libllvm-ocaml-dev libomp-dev libomp5 lld lldb llvm-dev llvm-runtime llvm python3-clang \
        pip \
        python-is-python3 \
        gcc \   
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/apt/*
# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

ENV DJANGO_SETTINGS_MODULE=backend.settings


# Run Django server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]
