import asyncio,json
from playwright.async_api import async_playwright
import os
BASE_URL=os.getenv('FARM_QA_URL','http://localhost:3030').rstrip('/')
KEY='duyen_four_fields_v1'
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  ctx=await b.new_context(viewport={'width':960,'height':640},device_scale_factor=0.5,accept_downloads=True)
  page=await ctx.new_page(); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
  seed={'version':1,'activePlot':0,'harvested':[[False]*12 for _ in range(4)],'memories':[],'position':{'x':-3.6,'z':8}}
  await page.add_init_script('if(!localStorage.getItem("'+KEY+'"))localStorage.setItem("'+KEY+'",'+json.dumps(json.dumps(seed))+');')
  await page.add_init_script('const q=new URLSearchParams(location.search);if(q.has("testX")){const s=JSON.parse(localStorage.getItem("'+KEY+'"));s.position={x:Number(q.get("testX")),z:Number(q.get("testZ"))};localStorage.setItem("'+KEY+'",JSON.stringify(s));}')
  centers=[(-3.6,8),(7.65,10.25),(10.8,1.25),(0,-3)]
  for plot,(x,z) in enumerate(centers):
   await page.goto(f'{BASE_URL}/?testX={x}&testZ={z}')
   print('Loading stage',plot+1,flush=True)
   await page.get_by_role('button',name='Tiếp tục khu vườn' if plot else 'Vào khu vườn',exact=True).click(timeout=90000)
   await page.get_by_role('button',name='🌾 Thu hoạch · Space',exact=True).wait_for()
   if plot==0:
    # Real movement and pause block, then harvest through actual keyboard.
    await page.locator('main').click(position={'x':650,'y':500})
    await page.keyboard.down('KeyD'); await page.wait_for_timeout(150); await page.keyboard.up('KeyD')
    await page.keyboard.down('KeyA'); await page.wait_for_timeout(150); await page.keyboard.up('KeyA')
    await page.get_by_role('button',name='Ⅱ Tạm dừng',exact=True).click()
    await page.evaluate('document.activeElement.blur()')
    before=await page.evaluate('(key)=>localStorage.getItem(key)',KEY)
    await page.keyboard.press('Space'); await page.wait_for_timeout(200)
    assert before==await page.evaluate('(key)=>localStorage.getItem(key)',KEY)
    await page.get_by_role('button',name='Tiếp tục',exact=True).click()
   for n in range(12):
    for attempt in range(20):
     if n==0 and plot==0 and attempt==0:
      await page.locator('main').click(position={'x':650,'y':500});await page.keyboard.press('Space')
     else:
      await page.get_by_role('button',name='🌾 Thu hoạch · Space',exact=True).click()
     await page.wait_for_timeout(1500)
     s=await page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',KEY)
     if sum(s['harvested'][plot])==n+1: break
    assert sum(s['harvested'][plot])==n+1,(plot,n,s)
    print('Harvest',plot+1,n+1,flush=True)
   dialog=page.get_by_role('dialog'); await dialog.wait_for(timeout=10000)
   assert len(s['memories'])==plot
   await page.screenshot(path=f'/tmp/duyen-four-fields-memory-{plot+1}.png')
   await dialog.get_by_role('button',name='Giữ ước mơ này' if plot==3 else 'Sang luống tiếp theo').click()
   await page.wait_for_timeout(1400)
   s=await page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',KEY)
   assert len(s['memories'])==plot+1
   print('Passed actual harvest and story stage',plot+1,flush=True)
  await page.get_by_role('heading',name='Đủ chỗ cho yêu thương 🏡').wait_for()
  await page.screenshot(path='/tmp/duyen-four-fields-victory.png')
  await page.get_by_role('button',name='Đọc lại chuyện của hai đứa').click()
  await page.get_by_role('button',name='☕ Một buổi hẹn, rất nhiều chuyện').click()
  assert await page.get_by_text('Hai người trò chuyện về đủ thứ trên đời.',exact=True).is_visible()
  await page.get_by_role('button',name='Về sổ chuyện',exact=True).click()
  await page.get_by_role('button',name='Về khu vườn',exact=True).click()
  async with page.expect_download() as info: await page.get_by_role('button',name='Tải bản lưu',exact=True).click()
  download=await info.value; await download.save_as('/tmp/duyen-four-fields-export.json')
  assert len(json.load(open('/tmp/duyen-four-fields-export.json'))['memories'])==4
  await page.get_by_role('button',name='Đọc lại chuyện của hai đứa').click()
  await page.set_viewport_size({'width':390,'height':844}); await page.screenshot(path='/tmp/duyen-four-fields-mobile-book.png')
  assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  print(json.dumps({'pageErrors':errors,'harvested':48,'stories':4,'saveExport':True,'mobileBook':True}),flush=True)
  assert not errors
  await b.close()
asyncio.run(main())
