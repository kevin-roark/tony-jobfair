{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 7,
			"minor" : 0,
			"revision" : 3,
			"architecture" : "x86",
			"modernui" : 1
		}
,
		"rect" : [ 59.0, 103.0, 932.0, 674.0 ],
		"bglocked" : 0,
		"openinpresentation" : 0,
		"default_fontsize" : 12.0,
		"default_fontface" : 0,
		"default_fontname" : "Arial",
		"gridonopen" : 1,
		"gridsize" : [ 15.0, 15.0 ],
		"gridsnaponopen" : 1,
		"objectsnaponopen" : 1,
		"statusbarvisible" : 2,
		"toolbarvisible" : 1,
		"lefttoolbarpinned" : 0,
		"toptoolbarpinned" : 0,
		"righttoolbarpinned" : 0,
		"bottomtoolbarpinned" : 0,
		"toolbars_unpinned_last_save" : 0,
		"tallnewobj" : 0,
		"boxanimatetime" : 200,
		"enablehscroll" : 1,
		"enablevscroll" : 1,
		"devicewidth" : 0.0,
		"description" : "",
		"digest" : "",
		"tags" : "",
		"style" : "",
		"subpatcher_template" : "",
		"boxes" : [ 			{
				"box" : 				{
					"id" : "obj-13",
					"linecount" : 2,
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 668.0, 563.0, 256.0, 35.0 ],
					"style" : "",
					"text" : "/Users/Dylan/Documents/Projects/tony-jobfair/public/media/results/success.wav"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-8",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 635.0, 531.0, 69.0, 22.0 ],
					"style" : "",
					"text" : "zl.stream 1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-5",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 507.0, 585.0, 50.0, 22.0 ],
					"style" : "",
					"text" : "8"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-2",
					"maxclass" : "number",
					"maximum" : 6,
					"minimum" : 1,
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 26.0, 86.0, 50.0, 22.0 ],
					"style" : ""
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-59",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "bang", "int" ],
					"patching_rect" : [ 660.5, 137.0, 30.0, 22.0 ],
					"style" : "",
					"text" : "t b i"
				}

			}
, 			{
				"box" : 				{
					"fontsize" : 24.0,
					"id" : "obj-56",
					"maxclass" : "number",
					"maximum" : 15,
					"minimum" : 0,
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 734.5, 66.0, 66.0, 35.0 ],
					"style" : ""
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-50",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "float" ],
					"patching_rect" : [ 650.0, 165.0, 29.5, 22.0 ],
					"style" : "",
					"text" : "* 0."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-45",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 650.0, 79.0, 72.0, 22.0 ],
					"style" : "",
					"text" : "loadmess 1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-42",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "float" ],
					"patching_rect" : [ 650.0, 109.0, 34.0, 22.0 ],
					"style" : "",
					"text" : "/ 15."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-39",
					"maxclass" : "newobj",
					"numinlets" : 0,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 189.0, 477.0, 40.0, 22.0 ],
					"style" : "",
					"text" : "r mult"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-38",
					"maxclass" : "newobj",
					"numinlets" : 0,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 288.0, 363.0, 34.0, 22.0 ],
					"style" : "",
					"text" : "r cut"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-37",
					"maxclass" : "newobj",
					"numinlets" : 0,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 213.0, 363.0, 37.0, 22.0 ],
					"style" : "",
					"text" : "r wet"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-36",
					"maxclass" : "newobj",
					"numinlets" : 0,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 363.0, 363.0, 48.0, 22.0 ],
					"style" : "",
					"text" : "r damp"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-35",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 822.0, 404.0, 43.0, 22.0 ],
					"style" : "",
					"text" : "s mult"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-34",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 822.0, 353.0, 36.0, 22.0 ],
					"style" : "",
					"text" : "s cut"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-33",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 822.0, 298.0, 39.0, 22.0 ],
					"style" : "",
					"text" : "s wet"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-32",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 822.0, 246.0, 50.0, 22.0 ],
					"style" : "",
					"text" : "s damp"
				}

			}
, 			{
				"box" : 				{
					"format" : 6,
					"id" : "obj-31",
					"maxclass" : "flonum",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 822.0, 206.0, 50.0, 22.0 ],
					"style" : ""
				}

			}
, 			{
				"box" : 				{
					"floatoutput" : 1,
					"id" : "obj-29",
					"maxclass" : "slider",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 650.0, 206.0, 170.0, 23.0 ],
					"size" : 1.0,
					"style" : ""
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-28",
					"maxclass" : "newobj",
					"numinlets" : 6,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 650.0, 246.0, 112.0, 22.0 ],
					"style" : "",
					"text" : "scale 0. 1. 100. 10."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-27",
					"maxclass" : "newobj",
					"numinlets" : 6,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 650.0, 353.0, 119.0, 22.0 ],
					"style" : "",
					"text" : "scale 0. 1. 0. 18000."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-26",
					"maxclass" : "newobj",
					"numinlets" : 6,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 650.0, 298.0, 112.0, 22.0 ],
					"style" : "",
					"text" : "scale 0. 1. 60. 96.5"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-25",
					"maxclass" : "newobj",
					"numinlets" : 6,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 650.0, 404.0, 99.0, 22.0 ],
					"style" : "",
					"text" : "scale 0. 1. 1.5 1."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-24",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "signal" ],
					"patching_rect" : [ 166.0, 517.0, 42.0, 22.0 ],
					"style" : "",
					"text" : "*~ 1.5"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-23",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "signal" ],
					"patching_rect" : [ 238.666672, 517.0, 42.0, 22.0 ],
					"style" : "",
					"text" : "*~ 1.5"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-22",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "int" ],
					"patching_rect" : [ 457.25, 441.0, 29.5, 22.0 ],
					"style" : "",
					"text" : "+ 1"
				}

			}
, 			{
				"box" : 				{
					"format" : 6,
					"id" : "obj-20",
					"maxclass" : "flonum",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 213.0, 396.0, 61.0, 22.0 ],
					"style" : ""
				}

			}
, 			{
				"box" : 				{
					"format" : 6,
					"id" : "obj-19",
					"maxclass" : "flonum",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 363.0, 396.0, 61.0, 22.0 ],
					"style" : ""
				}

			}
, 			{
				"box" : 				{
					"format" : 6,
					"id" : "obj-18",
					"maxclass" : "flonum",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 288.0, 396.0, 61.0, 22.0 ],
					"style" : ""
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-7",
					"maxclass" : "newobj",
					"numinlets" : 6,
					"numoutlets" : 4,
					"outlettype" : [ "signal", "signal", "signal", "signal" ],
					"patching_rect" : [ 166.0, 435.0, 237.0, 22.0 ],
					"style" : "",
					"text" : "rev3~ 100 95 5000 100"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-3",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "int" ],
					"patching_rect" : [ 457.25, 465.0, 38.0, 22.0 ],
					"style" : "",
					"text" : "% 10"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-16",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ],
					"patching_rect" : [ 457.25, 413.0, 43.0, 22.0 ],
					"style" : "",
					"text" : "unjoin"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-15",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 457.25, 389.0, 68.0, 22.0 ],
					"style" : "",
					"text" : "route done"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-14",
					"maxclass" : "ezdac~",
					"numinlets" : 2,
					"numoutlets" : 0,
					"patching_rect" : [ 163.0, 601.0, 45.0, 45.0 ],
					"style" : ""
				}

			}
, 			{
				"box" : 				{
					"clipheight" : 40.714287,
					"data" : 					{
						"clips" : [ 							{
								"filename" : "/Users/Dylan/Documents/Projects/tony-jobfair/public/media/startup/startup1.wav",
								"filekind" : "audiofile",
								"loop" : 0,
								"content_state" : 								{
									"timestretch" : [ 0 ],
									"slurtime" : [ 0.0 ],
									"pitchshiftcent" : [ 0 ],
									"play" : [ 2 ],
									"quality" : [ "basic" ],
									"originallengthms" : [ 0.0 ],
									"originallength" : [ 0.0, "ticks" ],
									"mode" : [ "basic" ],
									"pitchshift" : [ 1.0 ],
									"originaltempo" : [ 120.0 ],
									"formant" : [ 1.0 ],
									"followglobaltempo" : [ 0 ],
									"speed" : [ 1.0 ],
									"basictuning" : [ 440 ],
									"formantcorrection" : [ 0 ],
									"pitchcorrection" : [ 0 ]
								}

							}
, 							{
								"filename" : "/Users/Dylan/Documents/Projects/tony-jobfair/public/media/startup/startup2.wav",
								"filekind" : "audiofile",
								"loop" : 0,
								"content_state" : 								{
									"timestretch" : [ 0 ],
									"slurtime" : [ 0.0 ],
									"pitchshiftcent" : [ 0 ],
									"play" : [ 2 ],
									"quality" : [ "basic" ],
									"originallengthms" : [ 0.0 ],
									"originallength" : [ 0.0, "ticks" ],
									"mode" : [ "basic" ],
									"pitchshift" : [ 1.0 ],
									"originaltempo" : [ 120.0 ],
									"formant" : [ 1.0 ],
									"followglobaltempo" : [ 0 ],
									"speed" : [ 1.0 ],
									"basictuning" : [ 440 ],
									"formantcorrection" : [ 0 ],
									"pitchcorrection" : [ 0 ]
								}

							}
, 							{
								"filename" : "/Users/Dylan/Documents/Projects/tony-jobfair/public/media/startup/startup3.wav",
								"filekind" : "audiofile",
								"loop" : 0,
								"content_state" : 								{
									"timestretch" : [ 0 ],
									"slurtime" : [ 0.0 ],
									"pitchshiftcent" : [ 0 ],
									"play" : [ 2 ],
									"quality" : [ "basic" ],
									"originallengthms" : [ 0.0 ],
									"originallength" : [ 0.0, "ticks" ],
									"mode" : [ "basic" ],
									"pitchshift" : [ 1.0 ],
									"originaltempo" : [ 120.0 ],
									"formant" : [ 1.0 ],
									"followglobaltempo" : [ 0 ],
									"speed" : [ 1.0 ],
									"basictuning" : [ 440 ],
									"formantcorrection" : [ 0 ],
									"pitchcorrection" : [ 0 ]
								}

							}
, 							{
								"filename" : "/Users/Dylan/Documents/Projects/tony-jobfair/public/media/startup/startup4.wav",
								"filekind" : "audiofile",
								"loop" : 0,
								"content_state" : 								{
									"timestretch" : [ 0 ],
									"slurtime" : [ 0.0 ],
									"pitchshiftcent" : [ 0 ],
									"play" : [ 2 ],
									"quality" : [ "basic" ],
									"originallengthms" : [ 0.0 ],
									"originallength" : [ 0.0, "ticks" ],
									"mode" : [ "basic" ],
									"pitchshift" : [ 1.0 ],
									"originaltempo" : [ 120.0 ],
									"formant" : [ 1.0 ],
									"followglobaltempo" : [ 0 ],
									"speed" : [ 1.0 ],
									"basictuning" : [ 440 ],
									"formantcorrection" : [ 0 ],
									"pitchcorrection" : [ 0 ]
								}

							}
, 							{
								"filename" : "/Users/Dylan/Documents/Projects/tony-jobfair/public/media/startup/startup5.wav",
								"filekind" : "audiofile",
								"loop" : 0,
								"content_state" : 								{
									"timestretch" : [ 0 ],
									"slurtime" : [ 0.0 ],
									"pitchshiftcent" : [ 0 ],
									"play" : [ 2 ],
									"quality" : [ "basic" ],
									"originallengthms" : [ 0.0 ],
									"originallength" : [ 0.0, "ticks" ],
									"mode" : [ "basic" ],
									"pitchshift" : [ 1.0 ],
									"originaltempo" : [ 120.0 ],
									"formant" : [ 1.0 ],
									"followglobaltempo" : [ 0 ],
									"speed" : [ 1.0 ],
									"basictuning" : [ 440 ],
									"formantcorrection" : [ 0 ],
									"pitchcorrection" : [ 0 ]
								}

							}
, 							{
								"filename" : "/Users/Dylan/Documents/Projects/tony-jobfair/public/media/startup/startup6.wav",
								"filekind" : "audiofile",
								"loop" : 0,
								"content_state" : 								{
									"timestretch" : [ 0 ],
									"slurtime" : [ 0.0 ],
									"pitchshiftcent" : [ 0 ],
									"play" : [ 2 ],
									"quality" : [ "basic" ],
									"originallengthms" : [ 0.0 ],
									"originallength" : [ 0.0, "ticks" ],
									"mode" : [ "basic" ],
									"pitchshift" : [ 1.0 ],
									"originaltempo" : [ 120.0 ],
									"formant" : [ 1.0 ],
									"followglobaltempo" : [ 0 ],
									"speed" : [ 1.0 ],
									"basictuning" : [ 440 ],
									"formantcorrection" : [ 0 ],
									"pitchcorrection" : [ 0 ]
								}

							}
, 							{
								"filename" : "/Users/Dylan/Documents/Projects/tony-jobfair/public/media/results/success.wav",
								"filekind" : "audiofile",
								"loop" : 0,
								"content_state" : 								{
									"timestretch" : [ 0 ],
									"slurtime" : [ 0.0 ],
									"pitchshiftcent" : [ 0 ],
									"play" : [ 0 ],
									"quality" : [ "basic" ],
									"originallengthms" : [ 0.0 ],
									"originallength" : [ 0.0, "ticks" ],
									"mode" : [ "basic" ],
									"pitchshift" : [ 1.0 ],
									"originaltempo" : [ 120.0 ],
									"formant" : [ 1.0 ],
									"followglobaltempo" : [ 0 ],
									"speed" : [ 1.0 ],
									"basictuning" : [ 440 ],
									"formantcorrection" : [ 0 ],
									"pitchcorrection" : [ 0 ]
								}

							}
 ]
					}
,
					"id" : "obj-11",
					"maxclass" : "playlist~",
					"numinlets" : 1,
					"numoutlets" : 5,
					"outlettype" : [ "signal", "signal", "signal", "", "dictionary" ],
					"patching_rect" : [ 128.0, 34.0, 458.0, 292.0 ],
					"style" : ""
				}

			}
 ],
		"lines" : [ 			{
				"patchline" : 				{
					"destination" : [ "obj-15", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-11", 3 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-7", 1 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 247.25, 348.0, 198.0, 348.0, 198.0, 429.0, 219.100006, 429.0 ],
					"source" : [ "obj-11", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-7", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 137.5, 420.0, 175.5, 420.0 ],
					"source" : [ "obj-11", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-16", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-15", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-8", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-15", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-22", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-16", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-7", 4 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 297.5, 429.0, 349.899994, 429.0 ],
					"source" : [ "obj-18", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-7", 5 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 372.5, 429.0, 393.5, 429.0 ],
					"source" : [ "obj-19", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-11", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-2", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-7", 3 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 222.5, 426.0, 306.299988, 426.0 ],
					"source" : [ "obj-20", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-3", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-22", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-14", 1 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 248.166672, 588.0, 198.5, 588.0 ],
					"source" : [ "obj-23", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-14", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 175.5, 597.0, 172.5, 597.0 ],
					"source" : [ "obj-24", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-35", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-25", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-33", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-26", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-34", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-27", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-32", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-28", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-25", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-29", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-26", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-29", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-27", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-29", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-28", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-29", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-31", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 659.5, 232.0, 637.0, 232.0, 637.0, 193.0, 831.5, 193.0 ],
					"source" : [ "obj-29", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-11", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 466.75, 489.0, 435.0, 489.0, 435.0, 336.0, 114.0, 336.0, 114.0, 30.0, 137.5, 30.0 ],
					"source" : [ "obj-3", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-5", 1 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-3", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-19", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 372.5, 387.0, 372.5, 387.0 ],
					"source" : [ "obj-36", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-20", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 222.5, 387.0, 222.5, 387.0 ],
					"source" : [ "obj-37", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-18", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 297.5, 387.0, 297.5, 387.0 ],
					"source" : [ "obj-38", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-23", 1 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 198.5, 501.0, 271.166687, 501.0 ],
					"source" : [ "obj-39", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-24", 1 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 198.5, 501.0, 198.5, 501.0 ],
					"source" : [ "obj-39", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-50", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 659.5, 132.0, 659.5, 132.0 ],
					"source" : [ "obj-42", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-42", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 659.5, 102.0, 659.5, 102.0 ],
					"source" : [ "obj-45", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-29", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-50", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-59", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 744.0, 132.0, 670.0, 132.0 ],
					"source" : [ "obj-56", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-50", 1 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 681.0, 162.0, 670.0, 162.0 ],
					"source" : [ "obj-59", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-50", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 670.0, 162.0, 659.5, 162.0 ],
					"source" : [ "obj-59", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-23", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 248.166672, 459.0, 248.166672, 459.0 ],
					"source" : [ "obj-7", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-24", 0 ],
					"disabled" : 0,
					"hidden" : 0,
					"midpoints" : [ 175.5, 459.0, 175.5, 459.0 ],
					"source" : [ "obj-7", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-13", 1 ],
					"disabled" : 0,
					"hidden" : 0,
					"source" : [ "obj-8", 0 ]
				}

			}
 ],
		"dependency_cache" : [ 			{
				"name" : "rev3~.maxpat",
				"bootpath" : "~/Documents/Max 7/Library/Externals/rev31",
				"patcherrelativepath" : "../../../Max 7/Library/Externals/rev31",
				"type" : "JSON",
				"implicit" : 1
			}
 ],
		"embedsnapshot" : 0
	}

}
