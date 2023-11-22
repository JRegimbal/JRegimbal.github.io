---
title: "Thrash Unreal: Reducing 2DIY Instability while Rendering Textures"
author: Juliette Regimbal
date: 2023-08-23
tags:
    - "haptics"
    - "howto"
---

## What's this about? A quick introduction

The [Haply 2DIY](https://2diy.haply.co/) is a great low-cost force-feedback device, but like many force-feedback devices you may have stability issues, especially when working with velocity.
These problems could occur when trying to render different textures with the 2DIY, something I've seen coworkers struggle with.
This blog post will try to briefly explain *why* displaying textures can be difficult and go through some straightforward techniques to doing so.
Issues with measurements, slight imperfections in hardware, and high amounts of friction between the joints (especially on second generation models) will all result in some undesirable effects.
If you're unfamiliar, these cause problems in the following ways:

1. **Lower-quality encoders**: In addition to any noise, these encoders will provide coarser estimates of position than higher quality ones.
This is not too much of a concern when dealing with directly with position, but once your differentiate it to speed, these errors are amplified the faster a sampling rate you use for your haptics simulation.
2. **Imperfect measurements**: Position and force at the lowest level for force-feedback devices are *angular*: we're talking about radians and torque, not meters and Newtons.
This is an inconvenient situation, so APIs such as hAPI will use the expected kinematics of the device to swap between angular and Cartesian position and force values.
However, if the values in these equations do not match your actual hardware, this back-and-forth will not be accurate.
3. **Friction**: This problem pertains specifically to texture and similar "subtle" effects.
People are bad at perceiving slight changes in larger forces, so naturally if a device has a lot of internal friction the force effects you render that feel like friction will need to be larger to be noticed.
This internal friction isn't necessarily a bad thing,[^1] but it does require some creativity.

From here, I will be jumping into some modifications I made to sample code in order to render textures with more stability than a naive approach may get you.
If you're unfamiliar with the basics of computer haptics, you may want to consult a more in-depth guide.[^2]
You should also be somewhat familiar with the [2DIY sample code in Processing](https://2diy.haply.co).

[^1]: Hardware damping is necessary for passivity. See ["Factors Affecting the Z-Width of a Haptic Display" by J. Edward Colgate and J. Michael Brown, Proc. IEEE 1994 Int. Conf. Robotics & Automation](https://www.cim.mcgill.ca/~hayward/Teach/papers/Part-II/Colgate-Brown-94.pdf).
[^2]: E.g., [Engineering Haptic Devices](https://link.springer.com/book/10.1007/978-3-031-04536-3).

## Improving Velocity Estimates

[End-effector speed is a necessary factor](https://link.springer.com/book/10.1007/978-3-031-04536-3) in producing good haptic textures.
Accurate speed, however, is difficult to measure.
Since we are estimating velocity from measured position using numerical methods, any noise or error in what we can actually measure will negatively affect velocity.
There are two very straightforward ways to make our estimates better.

The first is to use the actual time between updates to the simulation rather than our ideal.
This may sound obvious, but the sample code uses hard coded values. If you are just adapting that, you will have an extra source of error and that may cause problems.
First, specify the target sampling rate for the simulation. In the examples, this is 1 kHz, so:
```java
final float targetRate = 1000; // Hz
```
If we want to know how much time elapses between updates, we need to know when the last one happened and the current time. While still initializing variables:
```java
long currTime = 0, lastTime = 0;
```
We should also schedule the simulation to run at our desired rate. In the setup function:
```java
scheduler.scheduleAtFixedRate(st, 1000, (long)(1000000f / targetRate), MICROSECONDS);
```
Finally, make the updates work better in our `Runnable` that gets data from the 2DIY, updates the simulation, and updates the force displayed on the end effector:
```java
lastTime = currTime;
currTime = System.nanoTime();
/** other important haptic stuff goes here */
velEE.set(posEE().sub(posEELast).mult((1000000000f)/(currTime - lastTime)));
```
Excellent! However, if you were to run your code now you might not notice a major difference in anything that uses velocity to produce a force. "What's the big idea? I thought this would help!" you might ask.
Don't worry, since we now have more accurate velocity estimates and all of our simulation is tied to one sampling rate variable, we can work on filtering out all of those higher-frequency probably-is-just-noise changes in velocity.
And when I say "filtering", I do really mean that we should use a low-pass filter on velocity. This is commonly used with force-feedback devices, but often is an "under-the-hood" feature you don't need to think about.
We, however, need to implement it ourselves.

For simplicity, I'll be using a 2nd order Butterworth filter with a cutoff frequency of 20 Hz.

I created a convenience class for this filter:
```java
public class Butter2 {  // 20 Hz at 1 kHz Butterworth
  private double coeffB[] = { 3.6217e-03,  7.2434e-03, 3.6217e-03 };
  private double coeffA[] = { -1.8227, 0.8372 }; // 1 implied
  private ArrayList<PVector> memory;
  private PVector outputs[] = { new PVector(0, 0), new PVector(0, 0) };
  public Butter2() {
    memory = new ArrayList<PVector>();
    for (int i = 0; i < coeffB.length; i++) {
      memory.add(new PVector(0, 0));
    }
  }
  public PVector push(PVector v) {
    memory.add(0, v);
    return memory.remove(memory.size() - 1);
  }
  public PVector calculate() {
    PVector tmp = new PVector(0, 0);
    for (int i = 0; i < coeffB.length; i++) {
      tmp.add(PVector.mult(memory.get(i), (float)coeffB[i]));
    }
    for (int i = 0; i < coeffA.length; i++) {
      tmp.sub(PVector.mult(outputs[i], (float)coeffA[i]));
    }
    outputs[1] = outputs[0];
    outputs[0] = new PVector(tmp.x, tmp.y);
    return tmp;
  }
}
```

Then, after creating our filter object with a handy `Butter2 filt = new Butter2();`, we can add it right after our change to the velocity estimate above:
```java
velEE.set(posEE.sub(posEELast).mult((1000000000f)/(currTime - lastTime)));
filt.push(velEE.copy());
velEE.set(filt.calculate());
posEELast.set(posEE);
```
Now you should be getting more reliable velocity estimates, dear reader.
This all being said, what filter to implement really depends on the particular model of hardware you're using and what you want to do with it.

## Adding Basic Textures

On to the textures! I am heavily adapting from some techniques used by [Culbertson et al.](https://doi.org/10.1109/HAPTICS.2014.6775475) with the Penn Haptic Texture Toolkit.
Their data-driven approach involved friction and texture models, where friction was in the opposite direction of velocity and texture was orthogonal to both friction and normal force.
This is a very quick-and-dirty version of those models that are not based on any real materials.
You could, however, adapt the toolkit to work with the 2DIY with some effort, taking into account the absence of a whole degree of freedom.

In the examples below, references are made to an object, `s`, that represents a textured region. This doesn't mean anything here, but is done since my full code has differently textured areas for which force is calculated separately.
The objects these represent are, more or less, data structures for where the area is and the parameters of that area.

### Friction

The challenge with friction is not adding in a constant resistance while the end effector in motion, but in mimicking static friction.
Since the 2DIY is, like most force-feedback devices, an impedance-based device, we are only measuring changes in position, not force.
Rendering a force in response to a user's motion before they move is not very likely to succeed so long as you are bounded by causality.

To get around this, we add virtual damping around speeds of 0 m/s that then transitions off into dynamic friction.
In my current implementation, this damping is present at up to 15 mm/s with an arbitrary normal force and damping coefficient selected:
```java
final float speed = velEE.mag();
final float vTh = 0.1; // m/s
final float fnorm = 0.25; // N
final float b = fnorm * s.mu / vTh; // s.mu is user selected
if (velEE.mag() < vTh) {
    force.set(force.add(velEE.copy().mult(-b)));
} else {
    force.set(force.add(velEE.copy().setMag(-s.mu * fnorm)));
}
```

### Vibration

The next part of the texture is vibration, which I break down into two parts: low frequency (25 Hz, representing coarse deformations) and high frequency (150 Hz, representing fine deformations).
Maximum forces for the low (`maxAL`) and high (`maxAH`) components are set for each texture.
Like Culbertson et al., these forces are displayed perpendicular to the direction of motion.
First, I define two new variables:
```java
float samp = 0;
final float textureConst = 2*PI/targetRate;
```
Then, I create the force vector for texture and add it to the overall force on the end effector at this moment in time:
```java
PVector fText = velEE.copy().rotate(HALF_PI).setMag(
    min(s.maxAH, speed * s.maxAH / vTh) * sin(textureConst * 150f * samp) +
    min(s.maxAL, speed * s.maxAL / vTh) * sin(textureConst * 25f * samp)
);
force.set(force.add(fText);
/** other things */
samp = (samp + 1) % targetRate;
```
With this done, all you need is to set the parameters for the texture(s) appropriately and add these to the overall force at each update.
All of the example code here was written in Processing, but should be easy to port to another environment. Good luck!

*Note: This was updated on 2023-09-19 to use a Butterworth filter and correct some fairly serious bugs with the filter I had here.*
