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
                html_libros+=tupla["titulo"]+" - "+tupla["precio"]+" €";
                html_libros+="</div>";
            });
            $('.contenedor_libros').html(html_libros);
        }
    })
    .fail(function(a,b){
        $('#errores').html(error_ajax_jquery(a,b));
        $('#principal').html("");
        localStorage.clear();
    });
}

function cargar_libros_admin()
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
            let html_libros="<table class='centrado txt_centrado'>";
            html_libros+="<tr><th>Referencia</th><th>Título</th><th>Acción</th></tr>";
            $.each(data.libros,function(key,tupla){
                html_libros+="<tr>";
                html_libros+="<td>"+tupla["referencia"]+"</td>";
                html_libros+="<td><button class='enlace' onclick='mostrar_detalles("+tupla["referencia"]+")';'>"+tupla["titulo"]+"</button></td>";
                html_libros+="<td><button class='enlace' onclick='montar_vista_borrar(\"" + tupla["referencia"] + "\");'>Borrar</button> - <button class='enlace' onclick='montar_vista_editar(\"" + tupla["referencia"] + "\")'>Editar</button></td>";
                html_libros+="</tr>";
            });
            $('#libros').html(html_libros);
        }
    })
    .fail(function(a,b){
        $('#errores').html(error_ajax_jquery(a,b));
        $('#principal').html("");
        localStorage.clear();
    });
}

function mostrar_detalles(referencia)
{
    
    if(((new Date()/1000)-localStorage.ultm_accion)<MINUTOS*60)
    {
        $.ajax({
            url:DIR_API+"/obtenerLibro/"+referencia,
            dataType:"json",
            type:"GET",
            headers:{Authorization:"Bearer "+localStorage.token}
        })
        .done(function(data){
            if(data.error)
            {
                $("#errores").html(data.error);
                $("#principal").html("");
            }
            else if(data.no_auth)
            {
                localStorage.clear();
                cargar_vista_login("El tiempo de sesión de la API ha expirado.");
            }
            else if(data.mensaje_baneo)
            {
                localStorage.clear();
                cargar_vista_login("Usted ya no se encuentra registrado en la BD.");
            }
            else
            {
                localStorage.setItem("ultm_accion",(new Date()/1000));
                localStorage.setItem("token",data.token);

                let html_detalles_libro="<h2>Detalles del Libro "+referencia+"</h2>";
                html_detalles_libro+="<p>";
                html_detalles_libro+="<strong>Título:</strong>"+data.libro["titulo"]+"<br>";
                html_detalles_libro+="<strong>Autor:</strong>"+data.libro["autor"]+"<br>";
                html_detalles_libro+="<strong>Descripción:</strong>"+data.libro["descripcion"]+"<br>";
                html_detalles_libro+="<strong>Precio:</strong>"+data.libro["precio"]+" €<br>";
                html_detalles_libro+="<img src='images/"+data.libro["portada"]+"' alt='Portada' title='Portada'>";
                html_detalles_libro+="</p>";
                html_detalles_libro+="<p><button onclick='cargar_formulario_agregar()'>Volver</button></p>";

                $("#respuestas").html(html_detalles_libro);

            }
          
        })
        .fail(function(a,b){
            $("#errores").html(error_ajax_jquery(a,b)); 
            $("#principal").html("");
            localStorage.clear();
        });
    }
    else
    {
        localStorage.clear();
        cargar_vista_login("Su tiempo de sesión ha expirado");
    }

}

function montar_vista_borrar(cod)
{
    let html_vista_borrar="<p class='txt_centrado'>Se dispone usted a borrar el producto: <strong>"+cod+"</strong></p>";
    html_vista_borrar+="<p class='txt_centrado'>¿Estás seguro?</p>";
    html_vista_borrar+="<p class='txt_centrado'><button onclick='borrar_respuestas()'>Cancelar</button> <button onclick='borrar_producto(\""+cod+"\")'>Continuar</button></p>";
    $("#respuestas").html(html_vista_borrar);
}

function montar_vista_editar(cod)
{
    $.ajax({
        url:DIR_API+"/producto/"+cod,
        dataType:"json",
        type:"GET"
    })
    .done(function(data){
        if(data.error)
        {
            $("#errores").html(data.error);
            $("#respuestas").html("");
            $("#productos").html("");
        }
        else if(data.mensaje)
        {
            let html_detalle_producto="<h2>Editando el Producto "+cod+"</h2>";
            html_detalle_producto+="<p>El producto ya no se encuentra en la BD</p>";
            $("#respuestas").html(html_detalle_producto);
            obtener_productos();
        }
        else
        {
        ;
            $.ajax({
                url:DIR_API+"/familias",
                dataType:"json",
                type:"GET"
            })
            .done(function(data2){
                if(data2.error)
                {
                    $("#errores").html(data2.error);
                    $("#respuestas").html("");
                    $("#productos").html("");
                }
                else
                {
                    let html_form_editar="<h2>Editando el Producto "+cod+"</h2>";
                    html_form_editar+="<form onsubmit='event.preventDefault();validar_form_editar(\""+cod+"\")'>";
                    if(data.producto["nombre"])
                        html_form_editar+="<p><label for='nombre'>Nombre: </label><input type='text' id='nombre' value='"+data.producto["nombre"]+"'/>";
                    else
                        html_form_editar+="<p><label for='nombre'>Nombre: </label><input type='text' id='nombre' />";
                    html_form_editar+="<p><label for='nombre_corto'>Nombre Corto: </label><input type='text' id='nombre_corto' value='"+data.producto["nombre_corto"]+"' required/><span class='error' id='error_nombre_corto'></span></p>";
                    html_form_editar+="<p><label for='descripcion'>Descripción: </label><textarea id='descripcion' required>"+data.producto["descripcion"]+"</textarea></p>";
                    html_form_editar+="<p><label for='PVP'>PVP: </label><input type='number' id='PVP' min='0.01' step='0.01' value='"+data.producto["PVP"]+"' required/></p>";
                    html_form_editar+="<p><label for='familia'>Familias:</label>";
                    html_form_editar+="<select id='familia'>";
                    $.each(data2.familias,function(key,tupla){
                        if(tupla["cod"]==data.producto["familia"])
                            html_form_editar+="<option selected value='"+tupla["cod"]+"'>"+tupla["nombre"]+"</option>";
                        else
                            html_form_editar+="<option value='"+tupla["cod"]+"'>"+tupla["nombre"]+"</option>";
                    });
                    html_form_editar+="</select>";
                    html_form_editar+="<p><button onclick='event.preventDefault(); borrar_respuestas();'>Volver</button><button>Continuar</button></p>";
                    html_form_editar+="</form>";
                    $("#respuestas").html(html_form_editar);
                }
            })
            .fail(function(a,b){
                $("#errores").html(error_ajax_jquery(a,b)); 
                $("#respuestas").html("");
                $("#productos").html("");
            });
        }
    })
    .fail(function(a,b){
        $("#errores").html(error_ajax_jquery(a,b)); 
        $("#respuestas").html("");
        $("#productos").html("");
    });
}

function cargar_formulario_agregar()
{
    $.ajax({
        url:DIR_API+"/crearLibro",
        dataType:"json",
        type:"GET"
    })
    .done(function(data){
        if(data.error)
        {
            $("#errores").html(data.error);
            $("#respuestas").html("");
            $("#productos").html("");
        }
        else
        {
            let html_form_agregar="<h2>Agregar un nuevo Libro</h2>";
            html_form_agregar+="<form onsubmit='event.preventDefault();validar_form_agregar()'>";
            html_form_agregar+="<p><label for='referencia'>Referencia: </label><input type='text' id='referencia' required/><span class='error' id='error_cod'></span></p>";
            html_form_agregar+="<p><label for='titulo'>Título: </label><input type='text' id='titulo' />";
            html_form_agregar+="<p><label for='autor'>Autor: </label><input type='text' id='autor' required/><span class='error' id='error_nombre_corto'></span></p>";
            html_form_agregar+="<p><label for='descripcion'>Descripción: </label><textarea id='descripcion' required></textarea></p>";
            html_form_agregar+="<p><label for='precio'>Precio: </label><input type='number' id='precio' min='0.01' step='0.01' required/></p>";
            html_form_agregar+="<p><label for='portada'>Portada:</label>";
            html_form_agregar+="<p><button onclick='event.preventDefault(); borrar_respuestas();'>Volver</button><button>Continuar</button></p>";
            html_form_agregar+="</form>";
            $("#respuestas").html(html_form_agregar);
        }
    })
    .fail(function(a,b){
        $("#errores").html(error_ajax_jquery(a,b)); 
        $("#respuestas").html("");
        $("#productos").html("");
    });
}

function validar_form_agregar()
{
    $("#error_cod").html("");
    $("#error_nombre_corto").html("");

    let cod=$('#cod').val();
    let nombre_corto=$('#nombre_corto').val();
    $.ajax({
        url:DIR_API+"/repetido/producto/cod/"+cod,
        dataType:"json",
        type:"GET"
    })
    .done(function(data){
        if(data.error)
        {
            $("#errores").html(data.error);
            $("#respuestas").html("");
            $("#productos").html("");
        }
        else if(data.repetido)
        {
            $("#error_cod").html(" Código repetido");
            $.ajax({
                url:DIR_API+"/repetido/producto/nombre_corto/"+nombre_corto,
                dataType:"json",
                type:"GET"
            })
            .done(function(data){
                if(data.error)
                {
                    $("#errores").html(data.error);
                    $("#respuestas").html("");
                    $("#productos").html("");
                }
                else if(data.repetido)
                {
                    
                    $("#error_nombre_corto").html(" Nombre corto repetido");
                }
                
            })
            .fail(function(a,b){
                $("#errores").html(error_ajax_jquery(a,b)); 
                $("#respuestas").html("");
                $("#productos").html("");
            });

        }
        else
        {
            $.ajax({
                url:DIR_API+"/repetido/producto/nombre_corto/"+nombre_corto,
                dataType:"json",
                type:"GET"
            })
            .done(function(data){
                if(data.error)
                {
                    $("#errores").html(data.error);
                    $("#respuestas").html("");
                    $("#productos").html("");
                }
                else if(data.repetido)
                {
                    $("#error_nombre_corto").html(" Nombre corto repetido");
                }
                else
                {
                    let nombre=$('#nombre').val();
                    let descripcion=$('#descripcion').val();
                    let PVP=$('#PVP').val();
                    let familia=$('#familia').val();

                    $.ajax({
                        url:DIR_API+"/producto/insertar",
                        dataType:"json",
                        type:"POST",
                        data:{"cod":cod,"nombre":nombre,"nombre_corto":nombre_corto,"descripcion":descripcion,"PVP":PVP,"familia":familia}
                    })
                    .done(function(data){
                        if(data.error)
                        {
                            $("#errores").html(data.error);
                            $("#respuestas").html("");
                            $("#productos").html("");
                        }
                        else
                        {
                            $("#respuestas").html("<p class='txt_centrado mensaje'>¡¡ Producto insertado con éxito !!</p>");
                            obtener_productos();
                        }
                    })
                    .fail(function(a,b){
                        $("#errores").html(error_ajax_jquery(a,b)); 
                        $("#respuestas").html("");
                        $("#productos").html("");
                    });


                }
                
            })
            .fail(function(a,b){
                $("#errores").html(error_ajax_jquery(a,b)); 
                $("#respuestas").html("");
                $("#productos").html("");
            });
        }
    })
    .fail(function(a,b){
        $("#errores").html(error_ajax_jquery(a,b)); 
        $("#respuestas").html("");
        $("#productos").html("");
    });

}

function borrar_producto(cod)
{
    $.ajax({
        url:DIR_API+"/producto/borrar/"+cod,
        dataType:"json",
        type:"DELETE"
    })
    .done(function(data){
        if(data.error)
        {
            $("#errores").html(data.error);
            $("#respuestas").html("");
            $("#productos").html("");
        }
        else
        {
            $("#respuestas").html("<p class='txt_centrado mensaje'>¡¡ Producto borrado con éxito !!</p>");
            obtener_productos();
        }
    })
    .fail(function(a,b){
        $("#errores").html(error_ajax_jquery(a,b)); 
        $("#respuestas").html("");
        $("#productos").html("");
    });
}

function borrar_respuestas()
{
    $("#respuestas").html("");
}

function error_ajax_jquery( jqXHR, textStatus) 
{
    var respuesta;
    if (jqXHR.status === 0) {
  
      respuesta='Not connect: Verify Network.';
  
    } else if (jqXHR.status == 404) {
  
      respuesta='Requested page not found [404]';
  
    } else if (jqXHR.status == 500) {
  
      respuesta='Internal Server Error [500].';
  
    } else if (textStatus === 'parsererror') {
  
      respuesta='Requested JSON parse failed.';
  
    } else if (textStatus === 'timeout') {
  
      respuesta='Time out error.';
  
    } else if (textStatus === 'abort') {
  
      respuesta='Ajax request aborted.';
  
    } else {
  
      respuesta='Uncaught Error: ' + jqXHR.responseText;
  
    }
    return respuesta;
}
