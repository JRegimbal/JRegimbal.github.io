var html = `
    <nav>
    <ul>
        <li id="title"><a href="#">Navigation</a></li>
        <li><a href="index.html">Home</a></li>
        <li><a href="cv-en.html">CV</a></li>
        <li><a href="http://github.com/JRegimbal">GitHub</a></li>
    </ul>
    </nav>
`;

document.getElementsByClassName('menu').item(0).innerHTML = html;
