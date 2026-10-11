import asyncio,os
from playwright.async_api import async_playwright
BASE_URL=os.getenv('FARM_QA_URL','http://localhost:3031').rstrip('/')
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  page=await b.new_page(viewport={'width':390,'height':844},accept_downloads=True)
  await page.add_init_script('localStorage.setItem("duyen_four_fields_v1","{broken-save")')
  await page.route('https://cdn.mint.gg/**',lambda r:r.abort())
  await page.goto(BASE_URL+'/')
  await page.get_by_role('heading',name='Chưa mở được khu vườn').wait_for()
  assert await page.evaluate('localStorage.getItem("duyen_four_fields_v1")')=='{broken-save'
  assert await page.get_by_text('Bản lưu chưa đọc được.',exact=False).is_visible()
  await page.screenshot(path='/tmp/duyen-four-fields-offline-error.png')
  await page.goto('about:blank')
  await page.goto(BASE_URL+'/')
  assert await page.evaluate('localStorage.getItem("duyen_four_fields_v1")')=='{broken-save'
  print('PASS CDN failure localized and corrupt save survives loading/pagehide',flush=True)
  await b.close()
asyncio.run(main())
