---
title: Home Lab Check-in 1
author: Juliette Regimbal
date: 2025-08-27
tags:
    - "Web"
---

This is a rough follow-up to [my previous post on self-hosting]({{% ref "self-hosting" %}}). It's taken longer than I expected to set up all my services, so I thought I would report on the current state of my home lab/server (I haven't decided what I'm calling it yet). I will also describe some adjustments I made when moving from a VPS to the small box in my living room.

### What is currently running?

At this point, I have six Linux containers (LXCs) running on Proxmox:
* Public services, in a restricted subnet
    * My personal cloud server;
    * This website;
    * A container for miscellaneous personal projects;
    * An reverse proxy for the above, loving called "Décarie" after the [interchange of the same name](https://en.wikipedia.org/wiki/Decarie_Interchange);
* Private services
    * A Tailscale machine; and
    * An Alpine container running ddclient so the public services work.

### What have I changed?

#### Containerization

On my VPS, everything was running directly on the system. I decided against using different containers initially since I was only running a single service (my cloud server), but over time I kept running more and more. I am most familiar with Docker containers, having used them in most of my recent projects. Proxmox supports LXCs and virtual machines, however, with most people seemingly installing Docker in a dedicated VM. I hadn't used LXCs before and decided to use them here to have a learning experience.

To keep the containers lightweight and straightforward to maintain, most of them are set up using Alpine Linux. I've used it before when working with Docker, and continue to appreciate it in this context. One package I needed to install did not run correctly with [musl](https://musl.libc.org/), so I ultimately ended up installing a minimal version of Debian (using glibc, of course) to finish setting up.

#### Website Updates

This website receives updates through GitHub actions, and the code needed to be reworked after the switch from the VPS. The previous action would build the site using [Hugo](https://gohugo.io/) and copy the files to the VPS using rsync. Since everything was installed directly on the VPS and SSH was already configured for system administration, this did not change the security of the server very much. The story is quite different now, since the website is in a container and neither Proxmox nor the guests/containers are running a SSH server!

To avoid setting up a route for rsync to continue working, I built a simple update webhook using [WSGI](https://peps.python.org/pep-3333/). Essentially, the server waits for an authenticated request to a specific endpoint of the server where the webhook resides. When it receives this request, it downloads the latest version of the website, builds with hugo, and updates the site in place. While I already used WSGI to build web services, this is actually the first time I used it for a small part of a site otherwise served normally by Apache. Doing this is much easier than I expected, although I found the documentation lacking, and overly oriented towards serving an entire web app.

#### System Administration

As mentioned above, I previously managed my VPS over SSH, but decided against a public-facing SSH server here. I do not want to expose the Proxmox host to the world, and honestly the web interface for managing Proxmox is so useful that I did not want to lose it. This is where the Tailscale container mentioned above becomes relevant. I configured the container to route to the Proxmox host so that it is accessible from anywhere. This was only set up last night, so I am still in the honeymoon phase of this feature. My opinions on it will probably mature as I actually use it for maintenance and bug fixes, though so far my feelings are positive.

### What comes next?

At this point, I am not sure what to set up next! I know people with a home server/lab that they use for home automation, AI models, and media servers, but my apartment is quite dumb, the Thinkcentre does not have a discrete GPU, and I am not a frequent TV/movie watcher. I have some nascent pet projects that would be public-facing, but I am missing some important supplies. My software-defined radio equipment has not seen much use these past few months, so I could use it to track flights using [ADS-B](https://en.wikipedia.org/wiki/Automatic_Dependent_Surveillance%E2%80%93Broadcast). Whatever I choose to do, I will eventually write about it here.
