"""Build a public Cloudflare Pages upload without source tools, tests or local state."""
from pathlib import Path
import subprocess
import shutil
import sys
ROOT=Path(__file__).resolve().parents[1]
DEST=Path(sys.argv[1]).resolve()
assert DEST != ROOT and ROOT not in DEST.parents, 'Use a build directory outside the checkout.'
DEST.mkdir(parents=True,exist_ok=True)
files=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z'],cwd=ROOT).decode().split('\0')
for name in sorted(set(files)):
    if not name or any(p.startswith('.') for p in Path(name).parts) or name.startswith(('tools/','tests/')) or name.lower().endswith(('.md','.toml','.py')):continue
    source=ROOT/name
    if not source.is_file():continue
    target=DEST/name;target.parent.mkdir(parents=True,exist_ok=True)
    if name=='_worker.js':
        # Testable helpers are not public Worker RPC entrypoints.
        code=source.read_text().replace('export const ','const ').replace('export function ','function ').replace('export async function ','async function ')
        target.write_text(code)
    else:shutil.copyfile(source,target)
print(f'Public package: {DEST}')
