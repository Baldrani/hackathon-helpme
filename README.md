# Usage
Custom case :
- Djingo j'ai un problème avec mon iPhone.
- Mon iPhone ne fait plus de son en haut parleur.
- Oui
- Non

Bonus :
- Menu

- Montre moi une vidéo de comment réparer un ordinateur

Les implémentations sont en parti en dur n'ayant pas eu le temps de faire tous les webhook. Cependant les fonctions sont crées et prêtent à l'emploi. C'est avant tout pour donner une idée des possibilités qui s'offrent à nous à travers un tel bot.
# Todo
Use WikiHow API https://market.mashape.com/hargrimm/wikihow

# Local solution
Download and install [ngrok](https://ngrok.com/) run it on port 5000 : `ngrok http -bind-tls=true 5000`

Use the ngrok address as fulfillment address then go do your folder and run `node index.js`

# Deployement
`git push heroku master`

And change fulfillement webhook address with :

 https://git.heroku.com/warm-bastion-99604.git

# Workflow
In case of new feature :

`git checkout master`
`git pull --rebase`
`git checkout -b feature/my-feature`

Once feature is ready, create a pull request


## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```
or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)
