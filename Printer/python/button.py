#!/usr/bin/env python3

from gpiozero import Button
from time import sleep
import signal
import subprocess
import os
import random

button = Button(2)

# https://stackoverflow.com/questions/4789837/how-to-terminate-a-python-subprocess-launched-with-shell-true
def button_callback():
    print("Button was pushed!")
    cmd = "zplgfa -file tickets/" + str(random.randrange(0,80)) + ".png | nc 192.168.8.162 9100"
    # cmd = "zplgfa -file tickets/" + "1" + ".png | nc 192.168.8.162 9100"
    proc = subprocess.Popen([cmd], stdout=subprocess.PIPE, shell=True, preexec_fn=os.setsid)
    # os.system("zplgfa -file tickets/3.png | nc 192.168.8.162 9100")
    sleep(5)
    # proc.terminate
    os.killpg(os.getpgid(proc.pid), signal.SIGTERM)

button_callback()

button.when_pressed = button_callback

# while True:
#     if button.is_pressed:
#         print("pressed!")
#         sleep(.5)

signal.pause()


# import RPi.GPIO as GPIO 
# import time

# # def button_callback(channel):
# #     print("Button was pushed!")
# #     time.sleep(1)

# # Ignore warning for now
# GPIO.setwarnings(False) 

# # Use physical pin numbering
# GPIO.setmode(GPIO.BOARD) 

# # Set pin 10 to be an input pin and set initial value to be pulled low (off)
# GPIO.setup(10, GPIO.IN, pull_up_down=GPIO.PUD_DOWN) 

# while True: # Run forever
#     if GPIO.input(10) == GPIO.HIGH:
#         print("Button was pushed!")
#         time.sleep(1)


# #  # Setup event on pin 10 rising edge
# # GPIO.add_event_detect(10,GPIO.RISING,callback=button_callback)

# # # Run until someone presses enter
# # message = input("Press enter to quit\n\n") 

# # # Clean up
# # GPIO.cleanup() 