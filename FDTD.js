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
let Nz = NBUFZ[0] + NBUFZ[1] + 3;

/*COMPUTE AXIS*/
/*ADD more points*/
let za = Array(Nz).fill(1.0);
for(let i = 0; i < za.length; i++)
{
	za[i] = i;
}

/*INITIALIZE FIELDS*/
let Ey = Array(Nz).fill(0.0);
let Hx = Array(Nz).fill(0.0);

/*INITIALIZE BOURNDARY TERMS*/
let H1 = 0;
let H2 = 0;
let H3 = 0;
let E1 = 0;
let E2 = 0;
let E3 = 0;

/*GAUSSIAN SOURCE OBJECT*/
let Gaussian;

/*DEVICE OBJECT*/
let Slab;

/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% PERFORM SETUP CODE FOR JAVASCRIPT CANVAS
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
function setup()
{
	let canvas = document.getElementById("FDTD-canvas");
	context = canvas.getContext("2d");
	width = canvas.width;
	height = canvas.height;
	
	requestAnimationFrame(draw);
	
	Gaussian = new Source(50, 4, 2, 20, Nz, za);
	Slab = new Device(1.0, 5.0, 1.0, 1.0, 5.0e9, Nz, Nz/2 + 200, dz, 150, 150);
	
	/*Slider callback functions*/
	Amplitude_Slider = document.getElementById("slider-amplitude");
	Amplitude_Slider.oninput = Amplitude_Change;
	
	Standard_Slider = document.getElementById("slider-standard");
	Standard_Slider.oninput = Standard_Change;
	
	Mean_Slider = document.getElementById("slider-mean");
	Mean_Slider.oninput = Mean_Change;
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
		Hx[nz] = Hx[nz] + Slab.GetmHx(nz)*(Ey[nz+1] - Ey[nz])/dz;
	}
	Hx[Nz-1] = Hx[Nz-1] + Slab.GetmHx(Nz-1)*(E3 - Ey[Nz-1])/dz;
	
	/*Record H-Field at Boudnary*/
	H3 = H2;
	H2 = H1;
	H1 = Hx[0];
	
	
	Ey[0] = Ey[0] + Slab.GetmEy(0)*(Hx[0] - H3)/dz;
	/*Update E from H*/
	for(let nz=1; nz < Nz; nz++)
	{
		Ey[nz] = Ey[nz] + Slab.GetmEy(nz)*(Hx[nz] - Hx[nz-1])/dz;
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
	plot(context, za, Gaussian.GetSource(), 0, height/2 - 150, "green");
	plot(context, za, Ey, 0, height/2, "blue");
	plot(context, za, Hx, 0, height/2, "red");
	Slab.Draw(context, height/2);
	requestAnimationFrame(draw);
}


