let context;
let width;
let height;

/*CONSTANTS*/
let c0 = 299792458;

/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% DASHBOARD
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
/*SOURCE PARAMETERS*/
let fmax = 5.0e9;
let Amplitude = 50;
let sigma = 4;
let std_dev = 2;
let variance = Math.pow(std_dev, 2);
let mean = 80;

/*GRID PARAMETERS*/
/*Ask Dr. Rumpf how is it that I can improve the grid parameters*/
let nmax = 1;
let NLAM = 20;
let NBUFZ = [300, 300];


/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% COMPUTE OPTIMIZED GRID
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
/*NOMINAL RESOLUTION*/
let lam0 = c0/fmax;
let dz = lam0/nmax/NLAM;

/*COMPUTE GRID SIZE*/
let Nz = NBUFZ[0] + NBUFZ[1] + 3;

/*COMPUTE AXIS*/
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


/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% COMPUTE THE SOURCE
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
/*COMPUTE TIME STEP */
let nbc = Math.sqrt(UR[0]*ER[0]);
let dt = nbc*dz/(2*c0);

/*COMPUTE SOURCE PARAMETERS*/
let tau = 0.5/fmax;
let t0 = 5*tau;

/*COMPUTE NUMBER OF TIME STEPS*/
let tprop = nmax*Nz*dz/c0;
let t = 2*t0 + 3*tprop;
let STEPS = Math.ceil(t/dt);

/*COMPUTE THE SOURCE*/
t = Array(STEPS).fill(1.0);
for(let i=0; i < t.length; i++)
{
	t[i] = i*dt;
}
let nz_src = Math.round(Nz/2);
let ESRC = Array(Nz).fill(0.0);
for(let i=0; i < ESRC.length; i++)
{
	/*The gaussian filter appears to not be working properly*/
	/*Plot this first*/
	let num = Math.pow((za[i] - mean), 2);
	let den =  Math.pow((variance*2), 2);
	
	ESRC[i] = Amplitude*Math.exp(-num/den);
}

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

let T = 0;

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
	
	/*Dirichlet Boundary Condition for Hx*/
	Hx[Nz-1] = Hx[Nz-1] + mHx[Nz-1]*(0 - Ey[Nz-1])/dz;
	
	
	/*Dirichlet Boundary Condition for Ey*/
	Ey[0] = Ey[0] + mEy[0]*(Hx[0] - 0)/dz;
	/*Update E from H*/
	for(let nz=1; nz < Nz; nz++)
	{
		Ey[nz] = Ey[nz] + mEy[nz]*(Hx[nz] - Hx[nz-1])/dz;
	}
	
	/*Inject E source*/
	/*Controlling the amount of source injections gives a better simulation, 
	ask Dr. Rumpf*/
	if(T < ESRC.length)
	{
		Ey[nz_src] = Ey[nz_src] + ESRC[T++];
	}
}

function draw()
{
	update();
		
	context.clearRect(0,0,width,height);
	plot(context, za, ESRC, 0, height/2 - Amplitude, "green");
	plot(context, za, Ey, 0, height/2, "blue");
	plot(context, za, Hx, 0, height/2, "red");
	requestAnimationFrame(draw);
}


