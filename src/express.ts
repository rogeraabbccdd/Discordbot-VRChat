import * as express from 'express'
import { link } from './controllers/users'
import { loginUrl, loginUrlShort, inviteUrl } from './utils/misc'

export let app: express.Application

if (process.argv.includes('-web') || (!process.argv.includes('-web') && !process.argv.includes('-bot'))) {
  // Init Express server for link account page
  app = express()
  app.listen(process.env.PORT, () => {
    console.log('Web server started at port ' + process.env.PORT)
  })

  // Handle post request
  app.use(express.json())

  // Hnadle json parsing error
  app.use((_error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(400).send({ success: false, message: 'Invalid Data Format' })
  })

  // Handle ajax requests from front end
  app.post('/link', link)

  app.get('/link', (req: express.Request, res: express.Response) => {
    res.redirect(loginUrl)
  })

  app.get('/invite', (req: express.Request, res: express.Response) => {
    res.redirect(inviteUrl)
  })

  // Handle web requests
  app.get('/', (req: express.Request, res: express.Response) => {
    res.render(process.cwd() + '/src/webpages/index.pug', {
      loginUrlShort,
      apiURL: new URL('/link', process.env.HOST_URL).toString()
    })
  })

  // 404
  app.all('*', (req: express.Request, res: express.Response) => {
    res.status(404).send('404')
  })
}
