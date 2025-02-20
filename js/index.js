function cargar_libros_normal()
{
    $.ajax({
        url:DIR_API+"/obtenerLibros",
        type:"GET",
        dataType:"json"
    })
    .done(function(data){
        if(data.error)
        {
            $('#errores').html(data.error);
            $('#principal').html("");
            localStorage.clear();
        }
        else
        {
            let html_libros="";
            $.each(data.libros,function(key,tupla){
                html_libros+="<div>";
                html_libros+="<img src='images/"+tupla["portada"]+"' alt='Portada' title='Portada'><br>";
                html_libros+=tupla["titulo"]+" - "+tupla["precio"];
                html_libros+="</div>";
            });
            html_libros+="</div>";
            $('.contenedor_libros').html(html_libros);
        }
    })
    .fail(function(a,b){
        $('#errores').html(error_ajax_jquery(a,b));
        $('#principal').html("");
    });
}