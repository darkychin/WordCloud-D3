FROM ubuntu:22.04

# Install prerequisites: curl, git, and the Docker CLI
RUN apt-get update && apt-get install -y curl git docker.io && rm -rf /var/lib/apt/lists/*

# Install nektos/act
RUN curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/nektos/act/master/install.sh | bash -s -- -b /usr/local/bin

ENTRYPOINT ["act"]


# Recommended enhancement is to create a shared user group instead of running as root
# source: https://www.avonture.be/blog/docker-out-of-docker-dood/