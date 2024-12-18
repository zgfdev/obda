import puppeteer from 'puppeteer';
function buttonClick(){
  (async () => {
    const browser = await puppeteer.launch({ headless: false }); // 设置为 false 会打开浏览器窗口，便于调试
    const page = await browser.newPage();
    // await page.goto('http://localhost/test/browser/');
    // await page.waitForSelector('#btnTest');
    // await page.click('#btnTest');
    // await page.waitForTimeout(5000);

    await page.goto('https://analytics.google.com/analytics/web/#/a89339688p443397177/admin/datapolicies/datacollection');
    await browser.close();
})();
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
import pLimit from 'p-limit';
const limit = pLimit(10);//限制并发10个请求
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/