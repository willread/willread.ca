"use strict";$.ajax({url:"https://protected-bastion-41335.herokuapp.com/beers",dataType:"jsonp",success:function(e){document.querySelector('[data-value="beers"]').innerText=e}}),$.ajax({url:"https://protected-bastion-41335.herokuapp.com/games",dataType:"jsonp",success:function(e){document.querySelector('[data-value="games"]').innerText=e}}),$.ajax({url:"https://protected-bastion-41335.herokuapp.com/songs",dataType:"jsonp",success:function(e){document.querySelector('[data-value="songs"]').innerText=e}}),$.ajax({url:"https://protected-bastion-41335.herokuapp.com/repos",dataType:"jsonp",success:function(e){document.querySelector('[data-value="repos"]').innerText=e}});