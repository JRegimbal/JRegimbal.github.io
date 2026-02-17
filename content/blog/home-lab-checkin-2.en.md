---
title: Home Lab Check-in 2
author: Juliette Regimbal
date: 2026-02-16
tags:
    - "Web"
---

It has been a while since I last wrote about [my experience self-hosting]({{% ref "home-lab-checkin-1" %}}). Unfortunately, that is due more to a lack of time than to a lack of problems. I have not been able to start as many self-hosting projects as I originally intended with how busy I have been finishing my PhD, starting a new job, and mentally recovering from both of those changes. However, I did make an "easy" addition to my Proxmox box: I set up a [pi-hole](https://pi-hole.net/) container for all my DNS needs.

Setting up the container was simple. Install alpine, install the pi-hole software, configure it, override the nameserver for the container to point to where the pi-hole gets its information (I use the [CIRA protected DNS servers](https://www.cira.ca/en/canadian-shield/) for this), and set my router to use the pi-hole for resolution.

This typically works fine. My requests will resolve, my DNS server is accessible to my phone through Tailscale, and I do not delve too deep into the occult art that is domain name resolution.

Then, without warning, the router will cease to connect to the pi-hole container. The pi-hole still works, mind you. I can send queries to it using dig without a problem and receive the answers I expect. The router simply does not send the request. A short time later, everything on my network begins to behave as if it does not have internet access. I will attempt to debug, scratch my head for a bit, and give up, setting the router to just query the nameserver the pi-hole uses.

A few days or weeks later, I convince myself this was just a fluke, switch the settings back over, and DNS works perfectly until it doesn't. I'll then mutter about my bad luck, wonder if my belief in the determinism of DNS has fully crossed into the realm of theology, and repeat the process all over again.

Sadly, I do not actually have a resolution to this yet. I have not had the combination of time and mental fortitude to find a root cause, and honestly I suspect it may have something to do with me using the ISP-provided router. I know, I have been meaning to switch, I just have been waiting until I do some redecorating in the corner where the ThinkCentre and router live. That should happen in spring (provided that data centers have not [driven up the price](https://www.cbc.ca/news/canada/calgary/ai-driving-up-ram-price-9.7011003) of routers yet) and at that time I will finally resolve this issue.

In the meantime, if someone happens to read this and *does* have an idea of what I can do, please don't hesitate to reach out. If not, please do not let this discourage you from self-hosting! My experience has been extremely smooth overall, it just isn't good blogging to write about a day where everything works exactly as expected.
