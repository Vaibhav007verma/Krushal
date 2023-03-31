if [ "$#" -ne 1 ]; then
    echo "You need to specify the environrment / flavour"
    exit 2
fi
flavour=$1
fileName=".env.${flavour}"
echo "Filename = ${fileName}"

grep -v "ENV_JSON=" ${fileName} > .env.tmp
#echo ENV_JSON=$(jq -c . env.json | jq -R) >> .env.tmp
echo ENV_JSON=$(jq -c . env.json) >> .env.tmp
mv .env.tmp ${fileName}
