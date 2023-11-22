$(function () {
	'use strict';

	let token = sessionStorage.getItem('token');
	//const ps = new PerfectScrollbar(document.querySelector('.mt-container'));

	$(document).ready(function(){

		dashboard();
		loadElections();

		$('#switch-polls').on('submit', function(e){
			e.preventDefault();
			loadChartData();
		})
	});

	function dashboard()
	{
		$.ajax({
			type:'GET',
			url:API_URL_ROOT+'/dashboard',
			dataType:'json',
			headers:{'x-access-token':token},
			success:function(response)
			{
				if(response.error == false)
				{
					var dashboard = response.dashboard;
					
					Chart(dashboard.chartData);
					$('.candidate-count').text(formatNumber(dashboard.candidate_count));
					$('.election-count').text(formatNumber(dashboard.election_count));
					$('.lga-count').text(formatNumber(dashboard.lga_count));
					$('.polling-unit-count').text(formatNumber(dashboard.polling_unit_count));
					$('.state-count').text(formatNumber(dashboard.state_count));
					$('.ward-count').text(formatNumber(dashboard.ward_count));
					$('.user-count').text(formatNumber(dashboard.user_count));
				}
				else
				{
					showSimpleMessage("Attention", response.message, "error");
				}
			},
			error:function(req, err, status)
			{
				showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
			}
		})
	}

	function Chart(data)
	{
        //polls
        var options2 = {
		  	chart: {
				fontFamily: 'Nunito, sans-serif',
				height: 365,
				type: 'area',
				zoom: {
					enabled: false
				},
				dropShadow: {
			  		enabled: true,
				  	opacity: 0.3,
				  	blur: 5,
				  	left: -7,
				  	top: 22
				},
				toolbar: {
			  		show: false
				},
				events: {
			  		mounted: function(ctx, config) {
						const highest1 = ctx.getHighestValueInSeries(0);
						const highest2 = ctx.getHighestValueInSeries(1);

						ctx.addPointAnnotation({
				  			x: new Date(ctx.w.globals.seriesX[0][ctx.w.globals.series[0].indexOf(highest1)]).getTime(),
				  			y: highest1,
				  			label: {
								style: {
					  				cssClass: 'd-none'
								}
				  			},
				  			customSVG: {
					  			SVG: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#1b55e2" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-circle"><circle cx="12" cy="12" r="10"></circle></svg>',
					  			cssClass: undefined,
					  			offsetX: -8,
					  			offsetY: 5
				  			}
						})

						ctx.addPointAnnotation({
				  			x: new Date(ctx.w.globals.seriesX[1][ctx.w.globals.series[1].indexOf(highest2)]).getTime(),
				  			y: highest2,
				  			label: {
								style: {
					  				cssClass: 'd-none'
								}
				  			},
				  			customSVG: {
					  			SVG: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#e7515a" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-circle"><circle cx="12" cy="12" r="10"></circle></svg>',
					  			cssClass: undefined,
					  			offsetX: -8,
					  			offsetY: 5
				  			}
						})
			  		},
				}
		  	},
			colors: [/*'#1b55e2',*/ '#e7515a', '#009688'],
			dataLabels: {
				enabled: false
			},
			markers: {
				discrete: [{
					seriesIndex: 0,
					dataPointIndex: 7,
					fillColor: '#000',
					strokeColor: '#000',
					size: 5
				}, 
				{
					seriesIndex: 2,
					dataPointIndex: 11,
					fillColor: '#000',
					strokeColor: '#000',
					size: 4
		  		}]
			},
			subtitle: {
				text: `Total Polls in (${data.electionTitle})`,
				align: 'left',
				margin: 0,
				offsetX: -10,
				offsetY: 35,
				floating: false,
				style: {
				  	fontSize: '14px',
				  	color:  '#888ea8'
				}
			},
			title: {
				text: `${data.totalPolls}`,
				align: 'left',
				margin: 0,
				offsetX: -10,
				offsetY: 0,
				floating: false,
				style: {
			  		fontSize: '25px',
				  	color:  '#bfc9d4'
				},
			},
			stroke: {
				show: true,
				curve: 'smooth',
				width: 2,
				lineCap: 'square'
			},
			series: [
				{
					name: 'Total Polls',
					data: data.polls
				}, 
				{
					name: 'Total Observed Polls',
					data: data.observedPolls
		 		}
			],
			labels: data.candidates,
			xaxis: {
				axisBorder: {
				  	show: false
				},
				axisTicks: {
						show: false
				},
				crosshairs: {
						show: true
				},
				labels: {
						offsetX: 0,
						offsetY: 5,
						style: {
							fontSize: '12px',
							fontFamily: 'Nunito, sans-serif',
							cssClass: 'apexcharts-xaxis-title',
						},
				}
			},
			yaxis: {
				labels: {
				  	formatter: function(value, index) {
						//return (value / 1000) + 'K'
						return (value / 1)
				  	},
				  	offsetX: -22,
				  	offsetY: 0,
				  	style: {
				  		fontSize: '12px',
					  	fontFamily: 'Nunito, sans-serif',
					  	cssClass: 'apexcharts-yaxis-title',
				  	},
				}
			},
			grid: {
				borderColor: '#191e3a',
				strokeDashArray: 5,
				xaxis: {
					lines: {
						show: true
					}
				},   
				yaxis: {
					lines: {
						show: false,
					}
				},
				padding: {
				  	top: 0,
				  	right: 0,
				  	bottom: 0,
				  	left: -10
				}, 
			}, 
			legend: {
				position: 'top',
				horizontalAlign: 'right',
				offsetY: -50,
				fontSize: '16px',
				fontFamily: 'Nunito, sans-serif',
				markers: {
				  	width: 10,
				  	height: 10,
				  	strokeWidth: 0,
				  	strokeColor: '#fff',
				  	fillColors: undefined,
				  	radius: 12,
				  	onClick: undefined,
				  	offsetX: 0,
				  	offsetY: 0
				},    
				itemMargin: {
				  	horizontal: 0,
				  	vertical: 20
				}
			},
			tooltip: {
				theme: 'dark',
				marker: {
			  		show: true,
				},
				x: {
				  	show: false,
				}
			},
			fill: {
				type:"gradient",
				gradient: {
					type: "vertical",
					shadeIntensity: 1,
					inverseColors: !1,
					opacityFrom: .28,
					opacityTo: .05,
					stops: [45, 100]
				}
			},
			responsive: [{
				breakpoint: 575,
				options: {
					legend: {
						offsetY: -30,
					},
				},
			}]
		}

		var chart2 = new ApexCharts(document.querySelector("#polls-chart"), options2);

		chart2.render();
	}

	function updateChart(data)
	{
		//polls
        var options2 = {
			chart: {
			  fontFamily: 'Nunito, sans-serif',
			  height: 365,
			  type: 'area',
			  zoom: {
				  enabled: false
			  },
			  dropShadow: {
					enabled: true,
					opacity: 0.3,
					blur: 5,
					left: -7,
					top: 22
			  },
			  toolbar: {
					show: false
			  },
			  events: {
					mounted: function(ctx, config) {
					  const highest1 = ctx.getHighestValueInSeries(0);
					  const highest2 = ctx.getHighestValueInSeries(1);

					  ctx.addPointAnnotation({
							x: new Date(ctx.w.globals.seriesX[0][ctx.w.globals.series[0].indexOf(highest1)]).getTime(),
							y: highest1,
							label: {
							  style: {
									cssClass: 'd-none'
							  }
							},
							customSVG: {
								SVG: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#1b55e2" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-circle"><circle cx="12" cy="12" r="10"></circle></svg>',
								cssClass: undefined,
								offsetX: -8,
								offsetY: 5
							}
					  })

					  ctx.addPointAnnotation({
							x: new Date(ctx.w.globals.seriesX[1][ctx.w.globals.series[1].indexOf(highest2)]).getTime(),
							y: highest2,
							label: {
							  style: {
									cssClass: 'd-none'
							  }
							},
							customSVG: {
								SVG: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#e7515a" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-circle"><circle cx="12" cy="12" r="10"></circle></svg>',
								cssClass: undefined,
								offsetX: -8,
								offsetY: 5
							}
					  })
					},
			  }
			},
		  colors: [/*'#1b55e2',*/ '#e7515a', '#009688'],
		  dataLabels: {
			  enabled: false
		  },
		  markers: {
			  discrete: [{
				  seriesIndex: 0,
				  dataPointIndex: 7,
				  fillColor: '#000',
				  strokeColor: '#000',
				  size: 5
			  }, 
			  {
				  seriesIndex: 2,
				  dataPointIndex: 11,
				  fillColor: '#000',
				  strokeColor: '#000',
				  size: 4
				}]
		  },
		  subtitle: {
			  text: 'Total Polls in this election',
			  align: 'left',
			  margin: 0,
			  offsetX: -10,
			  offsetY: 35,
			  floating: false,
			  style: {
					fontSize: '14px',
					color:  '#888ea8'
			  }
		  },
		  title: {
			  text: data.totalPolls,
			  align: 'left',
			  margin: 0,
			  offsetX: -10,
			  offsetY: 0,
			  floating: false,
			  style: {
					fontSize: '25px',
					color:  '#bfc9d4'
			  },
		  },
		  stroke: {
			  show: true,
			  curve: 'smooth',
			  width: 2,
			  lineCap: 'square'
		  },
		  series: [
			  {
				  name: 'Total Polls',
				  data: data.polls
			  }, 
			  {
				  name: 'Total Observed Polls',
				  data: data.observedPolls
			   }
		  ],
		  labels: data.candidates,
		  xaxis: {
			  axisBorder: {
					show: false
			  },
			  axisTicks: {
					  show: false
			  },
			  crosshairs: {
					  show: true
			  },
			  labels: {
					  offsetX: 0,
					  offsetY: 5,
					  style: {
						  fontSize: '12px',
						  fontFamily: 'Nunito, sans-serif',
						  cssClass: 'apexcharts-xaxis-title',
					  },
			  }
		  },
		  yaxis: {
			  labels: {
					formatter: function(value, index) {
					  return (value / 1000) + 'K'
					  //return (value / 1)
					},
					offsetX: -22,
					offsetY: 0,
					style: {
						fontSize: '12px',
						fontFamily: 'Nunito, sans-serif',
						cssClass: 'apexcharts-yaxis-title',
					},
			  }
		  },
		  grid: {
			  borderColor: '#191e3a',
			  strokeDashArray: 5,
			  xaxis: {
				  lines: {
					  show: true
				  }
			  },   
			  yaxis: {
				  lines: {
					  show: false,
				  }
			  },
			  padding: {
					top: 0,
					right: 0,
					bottom: 0,
					left: -10
			  }, 
		  }, 
		  legend: {
			  position: 'top',
			  horizontalAlign: 'right',
			  offsetY: -50,
			  fontSize: '16px',
			  fontFamily: 'Nunito, sans-serif',
			  markers: {
					width: 10,
					height: 10,
					strokeWidth: 0,
					strokeColor: '#fff',
					fillColors: undefined,
					radius: 12,
					onClick: undefined,
					offsetX: 0,
					offsetY: 0
			  },    
			  itemMargin: {
					horizontal: 0,
					vertical: 20
			  }
		  },
		  tooltip: {
			  theme: 'dark',
			  marker: {
					show: true,
			  },
			  x: {
					show: false,
			  }
		  },
		  fill: {
			  type:"gradient",
			  gradient: {
				  type: "vertical",
				  shadeIntensity: 1,
				  inverseColors: !1,
				  opacityFrom: .28,
				  opacityTo: .05,
				  stops: [45, 100]
			  }
		  },
		  responsive: [{
			  breakpoint: 575,
			  options: {
				  legend: {
					  offsetY: -30,
				  },
			  },
		  }]
	  }

	  var chart2 = new ApexCharts(document.querySelector("#polls-chart"), options2);

	  chart2.render();

	  chart2.updateOptions({
		series: [
			{
				name: 'Total Polls',
				data: data.polls
			}, 
			{
				name: 'Total Observed Polls',
				data: data.observedPolls
			 }
		],
	});
	}

	//load elections
    function loadElections()
    {
        blockUI();

        $.ajax({
            type:'GET',
            url: API_URL_ROOT+'/elections?election_status=Active',
            dataType: 'json',
            headers:{ 'x-access-token':token},
            success: function(response)
            {
                if(response.error == false)
                {
                    var elections = response.data;
                    var html = '';

                    for(var i = 0; i < elections.length; i++)
                    {
                        html += `
                            <option value="${elections[i].election_id}">${elections[i].election_title}</option>
                        `
                    }

                    $("select.election_id").append(html);
                    $('.selectpicker').selectpicker('refresh');
                    unblockUI();
                }
                else
                {
                    unblockUI();
                    showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");       
                }
            },
            error:function(req, status, error)
            {
                unblockUI();
                showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
            }
        })
    }

	//internal function to loadChartData
    function loadChartData() 
    {
		//name vairables
		var form = $('#switch-polls'); //form
		var electionID = form.find('select.election_id').val();
		var switchPollsModal = $('#switchPollsModal');
		var fields = form.find('input.required, select.required');

		blockUI();         

		for(var i=0;i<fields.length;i++)
		{
			if(fields[i].value == "")
			{
				/*alert(fields[i].id);*/
				unblockUI();  
				showSimpleMessage("Attention", `${fields[i].name} is required`, "error");
				$('#'+fields[i].id).focus();
				return false;
			}
		}

		$.ajax({
			type: 'GET',
			url: `${API_URL_ROOT}/chart-data/${electionID}`,
			dataType:'json',
			contentType:'application/json',
			headers:{'x-access-token':token},
			success: function(response)
			{
				if(response.error === false)
				{
					const data = response.chartData;
					updateChart(data)
					unblockUI(); 
					$('#switchPollsModal').find('.close').click();
				}
				else
				{
					unblockUI();   
					showSimpleMessage("Attention", response.message, "error");
				}
			},
			error: function(req, status, error)
			{
				unblockUI();  
				showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.responseText, "error");
			}
		});   
    }
});