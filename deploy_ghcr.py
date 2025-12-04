import paramiko
import sys

# Configuration
HOST = "192.168.3.99"
USER = "root"
PASS = "root"
# Specific tag from user
IMAGE = "ghcr.io/1williamaoayers/silver-trader:sha-1285ee7"

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
        # Mapping container port 80 to host port 8888 to avoid conflict with OpenWrt Admin UI (port 80)
        f"docker run -d --name silver-trader --restart always -p 8888:80 {IMAGE}"
    ]

    for cmd in commands:
        print(f"⚡ Executing: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        # Wait for command to finish
        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status == 0:
            print("✅ Success")
        else:
            error_msg = stderr.read().decode()
            # Docker pull prints progress to stdout/stderr differently, usually fine to ignore stderr if exit code is 0
            if exit_status != 0:
                 print(f"❌ Error: {error_msg}")

    client.close()
    print("\n✅ Deployment finished!")
    print(f"👉 Access your app at: http://{HOST}:8888")

if __name__ == "__main__":
    main()
