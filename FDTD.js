let context;
let width;
let height;

/*CONSTANTS*/
let c0 = 299792458;

/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% DASHBOARD
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/

let fmax = 5.0e9;

/*GRID PARAMETERS*/
let nmax = 1;
let NLAM = 100;
let lam0 = c0/fmax;
let dz = lam0/nmax/NLAM;

/*GRID PARAMETERS*/
let NBUFZ = [350, 350];

/*COMPUTE GRID SIZE*/
let Nz = NBUFZ[0] + NBUFZ[1];

/*COMPUTE AXIS*/
let za = Array(Nz).fill(1.0);
for(let i = 0; i < za.length; i++)
{
	za[i] = i;
}

/*INITIALIZE FIELDS*/
let Ey = Array(Nz).fill(0.0);
let Hx = Array(Nz).fill(0.0);

/*INITIALIZE BOUNDARY TERMS*/
let H1 = 0;
let H2 = 0;
let H3 = 0;
let E1 = 0;
let E2 = 0;
let E3 = 0;

/*GAUSSIAN SOURCE OBJECT*/
let Gaussian;

/*DEVICE OBJECTS*/
let Global;
let Slab1;
let Slab2;

/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% PERFORM SETUP CODE FOR JAVASCRIPT CANVAS
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
function setup()
{
	let canvas = document.getElementById("FDTD-canvas");
	context = canvas.getContext("2d");
	width = canvas.width;
	height = canvas.height;
	
	/*Create Source*/
	Gaussian = new Source(50, 4, 2, 20, Nz, za);
	
	/*Create global device filled with air*/
	Global = new Device(1.0, 1.0, width, 0, 0, dz);
	
	/*Create devices */
	Slab1 = new Device(5.0, 1.0, 50, 150, Nz/2 + 150, dz);
	Slab2 = new Device(12.0, 1.0, 50, 150, Nz/2 + 250, dz);
	Slab3 = new Device(30.0, 1.0, 50, 150, Nz/2 + 50, dz);
	
	/*Add slabs to global device*/
	Global.AddDevice(Slab1);
	Global.AddDevice(Slab2);
	Global.AddDevice(Slab3);
		
	/*Amplitude Slider callback functions*/
	Amplitude_Slider = document.getElementById("slider-amplitude");
	Amplitude_Slider.oninput = Amplitude_Change;
	
	/*Standard Deviation callback functions*/
	Standard_Slider = document.getElementById("slider-standard");
	Standard_Slider.oninput = Standard_Change;
	
	/*Mean callback functions*/
	Mean_Slider = document.getElementById("slider-mean");
	Mean_Slider.oninput = Mean_Change;
	
	requestAnimationFrame(draw);
}

function Amplitude_Change()
{
	Gaussian.SetAmplitude(Amplitude_Slider.value, za);
}

function Standard_Change()
{
	Gaussian.SetStandard(Standard_Slider.value, za);
}

function Mean_Change()
{
	Gaussian.SetMean(Mean_Slider.value, za);
}

function Inject_Source()
{
	Gaussian.ResetUpdate();
}


/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% UPDATE E AND H FIELDS USING THE FDTD IMPLEMENTATION
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
function update()
{
	/*Update H from E*/
	for(let nz=0; nz < Nz-1; nz++)
	{
		Hx[nz] = Hx[nz] + Global.GetmHx(nz)*(Ey[nz+1] - Ey[nz])/dz;
	}
	Hx[Nz-1] = Hx[Nz-1] + Global.GetmHx(Nz-1)*(E3 - Ey[Nz-1])/dz;
	
	/*Record H-Field at Boudnary*/
	H3 = H2;
	H2 = H1;
	H1 = Hx[0];
	
	
	Ey[0] = Ey[0] + Global.GetmEy(0)*(Hx[0] - H3)/dz;
	/*Update E from H*/
	for(let nz=1; nz < Nz; nz++)
	{
		Ey[nz] = Ey[nz] + Global.GetmEy(nz)*(Hx[nz] - Hx[nz-1])/dz;
	}
	
	/*Record E-Field at Boundary*/
	E3 = E2;
	E2 = E1;
	E1 = Ey[Nz - 1];
	
	/*Inject Gaussian E source*/
	Gaussian.Inject(Ey, Math.round(Nz/2));
}

function draw()
{
	update();
		
	context.clearRect(0,0,width,height);
	/*Plot Sources*/
	plot(context, za, Gaussian.GetSource(), 0, height/2 - 150, "green");
	plot(context, za, Ey, 0, height/2, "blue");
	plot(context, za, Hx, 0, height/2, "red");
	
	/*Draw slabs*/
	Slab1.Draw(context, height/2);
	Slab2.Draw(context, height/2);
	Slab3.Draw(context, height/2);
	
	requestAnimationFrame(draw);
}


