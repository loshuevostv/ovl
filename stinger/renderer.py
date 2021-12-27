from html2image import Html2Image

for i in range(1,121):
    delay = int(i*200/12)
    hti = Html2Image(output_path='frames/', custom_flags=['--virtual-time-budget='+ str(delay), '--hide-scrollbars'])
    hti.screenshot(html_file='stinger.html', size=(1920, 1080), save_as='frame-'+ str(i) +'.png')