import paramiko
import sys

# Configuration
HOST = "192.168.3.99"
USER = "root"
PASS = "root"
# Assuming your GitHub username and repo name. Adjust if needed.
IMAGE = "ghcr.io/1williamaoayers/silver-trader:latest"

def main():
    print(f"🚀 Deploying {IMAGE} to {HOST}...")
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(HOST, username=USER, password=PASS)
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

    commands = [
        f"docker pull {IMAGE}",
        "docker stop silver-trader || true",
        "docker rm silver-trader || true",
        # Run command - adjust ports/envs as needed
        f"docker run -d --name silver-trader --restart always --net host {IMAGE}"
    ]

    for cmd in commands:
        print(f"⚡ Executing: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        exit_status = stdout.channel.recv_exit_status()
        if exit_status == 0:
            print("✅ Success")
        else:
            print(f"❌ Error: {stderr.read().decode()}")

    client.close()
    print("\n✅ Deployment logic finished.")

if __name__ == "__main__":
    main()
