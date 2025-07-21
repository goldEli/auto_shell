import subprocess
import os

path = "/Users/eli/Documents/project/weex/language/web-language"



try:
    os.chdir(path)
    env = os.environ.copy()  # 获取当前 shell 的全部环境变量

    # 确保 SSH_AUTH_SOCK 被包含
    if 'SSH_AUTH_SOCK' not in env:
        print("Warning: SSH_AUTH_SOCK not found. You may not have access to SSH keys.")

    # git remote -v 输出
    # subprocess.run("git pull", shell=True)
    result = subprocess.run(
        ['git', 'remote', '-v'],
        capture_output=True,
        text=True,
        check=True  # 如果命令返回非零，抛出 CalledProcessError
    )
    print("Git Remote Output:\n", result.stdout)

    result = subprocess.run(
        ['git', 'pull'],
        capture_output=True,
        text=True,
        check=True  # 如果命令返回非零，抛出 CalledProcessError
    )
    print("Git Pull Output:\n", result.stdout)
except subprocess.CalledProcessError as e:
    print("Git Pull Failed:\n", e.stderr)