const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/UserFactory');

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-da-sandbox'] // decrease the testing time
        });

        const page = await browser.newPage();
        const customPage = new CustomPage(page);
        return new Proxy(customPage, {
            get: function (target, property) {
                return customPage[property] || browser[property] || page[property];
            }
        })
    }

    constructor(page) {
        this.page = page;
    }

    async login() {
        const user = await userFactory();
        const { session, sig } = sessionFactory(user)

        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: sig });
        await this.page.goto('http://localhost:3000/blogs');
        this.page.waitFor('a[href="/auth/logout"]');
    }

    async getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }

    get(path) {

        return this.page.evaluate(
            (_path) => {
                return fetch(_path, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ title: 'My title', content: 'My content' })
                }).then(res => res.json());
            }, path);
        // console.log(result)
    }

    post(_path, _data) {
        return this.page.evaluate(
            () => {
                return fetch(_path, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(_data)
                }).then(res => res.json());
            }, path, data);
        // console.log(result)
    }

    execRequests(actions = []) {
        Promise.all(actions.map(({ method, path, data }) => {
            return this[method](path, data);
        }));
    }

}

module.exports = CustomPage;

