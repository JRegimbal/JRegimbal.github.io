---
title: Home Lab Check-in 3
author: Juliette Regimbal
date: 2026-05-12
tags:
    - "Web"
---
This is a brief update to my [previous post about self-hosting]({{% ref "home-lab-checkin-2" %}}). I have not yet dealt with the DNS problems I mentioned back then as I have been too busy dealing with an intermittent problem where my Proxmox server would stop responding. Some processes (e.g., this website) would continue to work during these periods, but others (including any way to connect to the host itself) were unavailable. This was obviously far from ideal.

There were no actual error messages in the system logs either, only benign PCIe info messages saying that the kernel did not like my hardware. Most frightening of all, the logs would cut out roughly around the time the server would stop responding. My mind immediately went to worst case scenarios: weekends spent identifying and replacing dying hardware components, and new expenses that would ruin [my earlier savings calculations]({{% ref "self-hosting" %}}). Since I had no spare components to use and no clue as to where to start my debugging, I made a backup of the server and decided to wait until I had enough time to deal with the situation.

As I was messaging my partner to ask if they could manually reboot the server while I was away at CHI, an idea came to me: what if those PCIe messages *were* part of the problem? On more resource constrained systems I've definitely seen talkative debugging functions consume too much memory or storage and break far more important processes, but I hadn't considered that this might be what was happening here. I disabled the relevant error reporting feature in the kernel parameters, rebuilt my initramfs, and decided to wait and see if the error would return.

After several weeks, I think I can safely say that this solved the problem for me. Maybe there is some deeper underlying problem of hardware or configuration that would be better to solve in theory, but I honestly don't have the time or interest for that. I am a happy camper if the Proxmox system is working well enough to keep this website online and not mining crypto for a botnet. This was just a "fun" reminder of how different it can be to host things on hardware you own as opposed to a VPS.
