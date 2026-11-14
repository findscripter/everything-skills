"""Optional isolated replay of the pinned upstream scanner; no skill execution."""
import argparse
import hashlib
import json
import pathlib
import runpy
import sys
import tarfile

if sys.version_info < (3, 15):
    raise SystemExit("The reviewed upstream scanner requires Python >=3.15.")

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--consumer", type=pathlib.Path, required=True)
parser.add_argument("--archive", type=pathlib.Path, required=True)
args = parser.parse_args()
updater = args.consumer / "ci/scripts/agent-skills-update.py"
expected = "f5d0b9905b4c1dd4e1c63c7df961fe8125564626d24ab615d86c0b670906e774"
if hashlib.sha256(updater.read_bytes()).hexdigest() != expected:
    raise SystemExit("Updater differs from the reviewed canonical-LF source; stop and inspect it.")

sys.path.insert(0, str(args.consumer / "ci/lib/src"))
from agents.nix import archive_files, archive_tree, flatten_paths, group_paths, nar_hash

scan = runpy.run_path(str(updater))
rules = json.loads((args.consumer / "data/agent-skills/sources.json").read_text())
rule = rules["github:findscripter/everything-skills"]
with tarfile.open(args.archive) as archive:
    tree = archive_tree(archive)
    files = archive_files(tree)
    assert nar_hash(archive, tree) == "0Dldhe7z/6unYmNO+oSXiQJ3Axv9mukugX9DrSS67NI=", "Wrong library archive"
    canonical = scan["select_canonical"]("everything-skills", scan["find_skills"](files), scan["load_dirs"](files))
    default = scan["skills_in"]("everything-skills", files, {k: v for k, v in rule.items() if k != "skip"})
    configured = scan["skills_in"]("everything-skills", files, rule)
    override = scan["skills_in"]("everything-skills", files, rule | {"skip": False})
    assert default == []
    assert override == canonical and len(override) == 1116
    assert flatten_paths(group_paths(override)) == override
    print(json.dumps({"default": len(default), "configured": len(configured), "override": len(override)}, indent=2))
    assert configured == override, "Configured-source regression: missing skip:false override"
