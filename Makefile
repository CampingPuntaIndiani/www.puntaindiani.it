help:
	@echo "Run c preprocessor against a target file"
	@tail -n+4 Makefile

*.html:
	cpp -nostdinc -E -P "$@" | grep -v '^$$'

.PHONY: *
