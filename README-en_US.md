# OASIS Helper

[Tiếng Việt](./README.md)

## Introduction

I created this app to automatically write
Java documentation (Javadoc) for Java object
properties' getters and setters, and other
types of object methods as well.

[UET-OASIS](https://oasis.uet.vnu.edu.vn/)
is a learning platform for UET students
participating in Object Oriented Programming
(OOP) course, including me.

The platform demands us to write Javadoc
for **every** methods in our Java code.
Initially that seems trivial. But when
there are so many properties, the number
of the methods just *explodes* (since
each property usually has one getter
and one setter method, in addition
with other methods as well). Writing
Javadoc for all those methods, by hand,
is such a pain.

So this web app was born. You just have to
specify your Java class' general information,
its properties, and methods. The app will
automatically generate:

 1. the properties,
 2. its getters and setters,
 3. additional methods you specified,
 4. **along with Javadoc for all methods**
 **generated automatically for you**

so that OASIS will no longer catch your Javadoc
errors !

**TRY IT OUT** at <oasishelper.vercel.app>

## License

This project's source code shall be distributed
under the 3-clause BSD license. See
[`LICENSE.txt`](./LICENSE.txt) for details.
