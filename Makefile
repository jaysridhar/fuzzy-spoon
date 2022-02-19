      RSYNC_EXCLUDE = --exclude '*~' --exclude '.\#*' --exclude '\#*\#' --exclude '*.log' \
		      --exclude __pycache__ --exclude 'venv*' --exclude node_modules \
		      --exclude package-lock.json --exclude db.sqlite3

             SERVER = 136.243.155.232

           SSH_USER = jaysridhar@$(SERVER)

         RSYNC_PORT = 1244

          LOCAL_DIR = .

         TARGET_DIR = jaysridhar.worker2-vm/server/yodo1

         RSYNC_OPTS = -e "ssh -S '$(HOME)/.ssh/controlmasters/$(SSH_USER)'"

all:

upload: clean
	rsync $(RSYNC_EXCLUDE) -avz $(LOCAL_DIR) rsync://localhost:$(RSYNC_PORT)/$(TARGET_DIR)

watch: upload
	inotifywait --exclude '(~$$|^\#|^\.\#|^\.\/\.|\.log$$|^venv)' -m -r -e modify --format '%w%f' $(LOCAL_DIR) | while read MODFILE; do echo "$$(date --rfc-3339=seconds): $$MODFILE"; rsync $(RSYNC_EXCLUDE) -avz $(LOCAL_DIR) rsync://localhost:$(RSYNC_PORT)/$(TARGET_DIR); done

ssh-tunnel:
	ssh -nNf -M $(SSH_USER)
	ssh -S $(HOME)/.ssh/controlmasters/$(SSH_USER) -nNf -L $(RSYNC_PORT):localhost:4321 $(SSH_USER)

clean:
	find $(LOCAL_DIR) -name '*~' -exec rm {} \;
