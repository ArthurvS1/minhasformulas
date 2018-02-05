(function ($) {

	var $query  = $('#query');
	var template = `
		<a data-open="{{id}}" class="list-group-item list-group-item-action flex-column align-items-start open-data">
			<div class="d-flex w-100 justify-content-between">
				<h5 class="mb-1">
					{{titulo}}
				</h5>

				<small><span class="badge badge-{{cor}}">{{materia}}</span></small>
			</div>

			<p class="mb-1">{{texto}}</p>
		</a>
	`;
	var selectedTempl = `
			<div class="title text-center">
				<h4 class="pt-3">{{titulo}}. <span class="badge badge-{{cor}}">{{materia}}</span></h4>
				<a href="#selected" class="fav" data-fav="{{id}}" title="Adicionar/Remover aos favoritos"></a>
				<a href="#selected" class="return" title="Voltar"></a>
				<a href="#selected" class="refresh open-eq" data-eq="{{id}}"><i class="fas fa-sync"></i></a>
			</div>

			<div class="col-8 offset-2">
				<h5 class="font-weight-light text-justify">{{conteudo}}</h5>
			</div>
	`;
	var favTmpl = `
						<a href="#" class="list-group-item list-group-item-action flex-column align-items-start open-eq" data-dismiss="modal" data-eq="{{id}}">
							<div class="d-flex w-100 justify-content-between">
								<h5 class="mb-1">{{titulo}}</h5>
								<small><span class="badge badge-{{cor}}">{{materia}}</span></small>
							</div>

							<p class="mb-1">{{texto}}</p>
						</a>
	`;
	var selectedSubjects = [1, 2, 3];
	var materias =  ['Física', 'Matemática', 'Química'];

	$(document).on('click', '.open-eq', function() {
		openEq($(this).data('eq'));
	});

	$(document).on('click', '.open-data', function(e) {
		e.preventDefault();
		openEq($(this).data('open'));
	});

	var openEq = function(fid) {
		$('#result').html('');

		$.get('/search/get/' + fid, function(data) {
			if (data.length > 0) {
				$('#nothing').hide();

				let tmpl = selectedTempl;
				tmpl = tmpl.replace(/{{id}}/g, data[0].id);
				tmpl = tmpl.replace('{{titulo}}', data[0].titulo);
				tmpl = tmpl.replace('{{texto}}', data[0].texto);
				tmpl = tmpl.replace('{{materia}}', materias[data[0].materia - 1]);

				switch (data[0].materia) {
					case 1:
						tmpl = tmpl.replace('{{cor}}', 'danger');
						break;

					case 2:
						tmpl = tmpl.replace('{{cor}}', 'primary');
						break;

					case 3:
						tmpl = tmpl.replace('{{cor}}', 'warning');
						break;
				}

				tmpl = tmpl.replace('{{conteudo}}', data[0].conteudo);
				$('#selected').html(tmpl);
				addKatex();

				let c = JSON.parse(localStorage.getItem('fav')) || [];
				if (c.includes(fid)) {
					$('#selected .fav').addClass('is-fav');
				}
			} else {
				$('#nothing').show();
			}
		})
	};

	$('.open-fav').on('click', function(e) {
		let c = JSON.parse(localStorage.getItem('fav')) || [];
		$('#fav-list').html('');

		if (c.length == 0) {
			$('#sadf').show();
		} else {
			$('#sadf').hide();

			for (f in c) {
				let fid = +c[f];
				$.get('/search/get/' + fid, function(data) {
					let tmpl = favTmpl;

					tmpl = tmpl.replace('{{id}}', data[0].id);
					tmpl = tmpl.replace('{{titulo}}', data[0].titulo);
					tmpl = tmpl.replace('{{texto}}', data[0].texto);
					tmpl = tmpl.replace('{{materia}}', materias[data[0].materia - 1]);

					switch (data[0].materia) {
						case 1:
							tmpl = tmpl.replace('{{cor}}', 'danger');
							break;

						case 2:
							tmpl = tmpl.replace('{{cor}}', 'primary');
							break;

						case 3:
							tmpl = tmpl.replace('{{cor}}', 'warning');
							break;
					}

					$('#fav-list').append(tmpl);
				});
			}
		}
	});

	$(document).on('click', '.fav', function(e) {
		let fid = +$(this).data('fav');
		let c = JSON.parse(localStorage.getItem('fav')) || [];

		if (c.includes(fid)) {
			c.splice(c.indexOf(fid), 1);
			$(this).removeClass('is-fav');
		} else {
			c.push(fid);
			c.sort();
			$(this).addClass('is-fav');
		}

		localStorage.setItem('fav', JSON.stringify(c));
	});

	$('.checkboxes :checkbox').on('change', function(e) {
		if ($('.checkboxes :checkbox:checked').length == 0) {
			e.preventDefault();
			e.stopPropagation();
			this.checked = true;
		} else {
			if (this.checked) {
				selectedSubjects.push(+this.value);
				selectedSubjects.sort();
			} else {
				selectedSubjects.splice(+this.value - 1, 1);
			}

			refreshResults();
		}
	});

	$(document).on('click', '#setDefault, .return', function() {
		$('.checkboxes :checkbox').each(function() {
			this.checked = true;
		});

		selectedSubjects = [1, 2, 3];

		refreshResults();
	});

	$('#searchForm').on('submit', function(e) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	});

	var refreshResults = function() {
		$('#selected').html('');

		if ( !/^\s*$/.test($query.val()) ) {
			$.get('/search/' + ($query.val() == '*' ? 'all' : $query.val()).toLowerCase(), function(data) {
				$('#result').html('');

				if (data.length) {
					$('#nothing').hide();

					for (rs in data) {
						if (selectedSubjects.includes(data[rs].materia)) {
							let tmpl = template;
							tmpl = tmpl.replace(/{{id}}/g, data[rs].id);
							tmpl = tmpl.replace('{{titulo}}', data[rs].titulo);
							tmpl = tmpl.replace('{{texto}}', data[rs].texto);
							tmpl = tmpl.replace('{{materia}}', materias[data[rs].materia - 1]);

							switch (data[rs].materia) {
								case 1:
									tmpl = tmpl.replace('{{cor}}', 'danger');
									break;

								case 2:
									tmpl = tmpl.replace('{{cor}}', 'primary');
									break;

								case 3:
									tmpl = tmpl.replace('{{cor}}', 'warning');
									break;
							}

							$('#result').append(tmpl);
						}


						$query.removeClass('is-invalid');
					}
				} else {
					$query.addClass('is-invalid');
					$('#nothing').show();
				}
			});
		} else {
			$query.addClass('is-invalid');
			$('#result').html('');
			$('#nothing').show();
		}
	}

	$query.on('input', refreshResults);
	$('#tryAgain').on('click', refreshResults);

	var addKatex = function() {
		$('.tex').each(function() {
			let val = $(this).text();
			katex.render(val, this);
		});
	};

})( window.jQuery );