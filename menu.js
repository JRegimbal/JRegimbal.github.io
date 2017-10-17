var html = `
    <nav>
    <ul>
        <li><a href="index.html">Home/Accueil</a></li>
        <li><a href="cv-en.html">CV (English)</a></li>
        <li><a href="cv-fr.html">CV (Français)</a></li>
        <li><a href="http://github.com/JRegimbal" target="_blank">GitHub</a></li>
    </ul>
    </nav>
`;

document.getElementsByClassName('menu').item(0).innerHTML = html;
