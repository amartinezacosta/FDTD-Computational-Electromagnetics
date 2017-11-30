let context;
let width;
let height;

/*CONSTANTS*/
let c0 = 299792458;

/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% DASHBOARD
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
// /*SOURCE PARAMETERS*/
let fmax = 5.0e9;

/*GRID PARAMETERS*/
/*Ask Dr. Rumpf how is it that I can improve the grid parameters*/
let nmax = 1;
let NLAM = 20;
let NBUFZ = [350, 350];

/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% COMPUTE OPTIMIZED GRID
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
/*NOMINAL RESOLUTION*/
let lam0 = c0/fmax;
let dz = lam0/nmax/NLAM;

/*COMPUTE GRID SIZE*/
let Nz = NBUFZ[0] + NBUFZ[1] + 3;

/*COMPUTE AXIS*/
/*ADD more points*/
let za = Array(Nz).fill(1.0);
for(let i = 0; i < za.length; i++)
{
	za[i] = i;
}
/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% BUILD DEVICE ON GRID
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
let ER = Array(Nz).fill(1.0);
let UR = Array(Nz).fill(1.0);

for(let i = 100; i < 150; i++)
{
	ER[i] = 12.0;
}


/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% COMPUTE THE SOURCE
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
/*COMPUTE TIME STEP */
let nbc = Math.sqrt(UR[0]*ER[0]);
let dt = nbc*dz/(2*c0);

/*INITIALIZE FDTD PARAMETERS*/
let mEy = Array(Nz).fill(0);
let mHx = Array(Nz).fill(0);

for(let i=0;i < ER.length;i++)
{
	mEy[i] = (c0*dt)/ER[i];
}

for(let i=0;i < UR.length;i++)
{
	mHx[i] = (c0*dt)/UR[i];
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
		Hx[nz] = Hx[nz] + mHx[nz]*(Ey[nz+1] - Ey[nz])/dz;
	}
	Hx[Nz-1] = Hx[Nz-1] + mHx[Nz-1]*(E3 - Ey[Nz-1])/dz;
	
	/*Record H-Field at Boudnary*/
	H3 = H2;
	H2 = H1;
	H1 = Hx[0];
	
	
	Ey[0] = Ey[0] + mEy[0]*(Hx[0] - H3)/dz;
	/*Update E from H*/
	for(let nz=1; nz < Nz; nz++)
	{
		Ey[nz] = Ey[nz] + mEy[nz]*(Hx[nz] - Hx[nz-1])/dz;
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
	requestAnimationFrame(draw);
}


