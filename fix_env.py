import os

env_path = '/home/joon/classic-painters/backend/.env'
new_vars = {
    'DATABASE_URL': 'file:./dev.db',
    'TURSO_DATABASE_URL': 'libsql://classic-painters-cms-vercel-icfg-r3lafaz8tyflv3oeslbihuyy.aws-us-east-1.turso.io',
    'TURSO_AUTH_TOKEN': 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjgyMjU1MjQsImlkIjoiNDZiODE1ZTQtMjFhNS00YmNiLWExZTAtNjVjZTRmNzY5OTQ2IiwicmlkIjoiZmMxNGEzYzMtZjY5NC00OTljLWI4ZDktYzQzMzhiNTU3NWM4In0.QdjpC3g9-vTxrZLskOmei-faaiRKEaLB8JiKZwPuIZ0bPh07ukOfxahtRwkk6wOYd1hyOekZA_D7a9cbl4pbCg'
}

lines = []
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        lines = f.readlines()

updated_lines = []
keys_handled = set()

for line in lines:
    stripped = line.strip()
    if stripped and not stripped.startswith('#') and '=' in stripped:
        key = stripped.split('=')[0].strip()
        if key in new_vars:
            updated_lines.append(f'{key}="{new_vars[key]}"\n')
            keys_handled.add(key)
            continue
    updated_lines.append(line)

for key, value in new_vars.items():
    if key not in keys_handled:
        updated_lines.append(f'{key}="{value}"\n')

with open(env_path, 'w') as f:
    f.writelines(updated_lines)

print("Successfully fixed .env file. DATABASE_URL is now file:./dev.db to satisfy Prisma validation.")
