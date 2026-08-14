# How to run ACT - Commands locally

1. Start with running compose to build the image
```bash
docker compose -f docker-compose.yml up --build -d
```
No need to rebuild image when you have updated workflows code.

2. Go into the running container's shell
```bash
docker compose -f docker-compose.yml exec "act-test" sh
```

3. Then run your `act` commands
```bash
# List all available jobs
act -l

# Run default push event with attached secrets
act --secret-file .env.local

# Run default push event with: 
# - "e" to add act flag for reusable workflow to skip jobs, read: https://nektosact.com/usage/index.html#skipping-jobs
# - target main action yml with "-W"
act -W '.github/workflows/github-action.yml' --secret-file .env.local -e event.json

# Run a specific job name
act -j my_job_name
```

4. To shutdown when finish
```bash
docker compose -f docker-compose.yml down
```