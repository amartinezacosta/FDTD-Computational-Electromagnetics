let context;
let width;
let height;

/*CONSTANTS*/
let c0 = 299792458;

/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% DASHBOARD
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
let dz = 0.006;
let Nz = 400;
let dt = 1e-11;

/*SOURCE PARAMETERS*/
let fmax = 5.0e9;
let Amplitude = 10;

/*GRID PARAMETERS*/
let nmax = 1;
let NLAM = 10;
let NBUFZ = [100, 100];


/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% COMPUTE OPTIMIZED GRID
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
/*NOMINAL RESOLUTION*/
let lam0 = c0/fmax;
dz = lam0/nmax/NLAM;

/*COMPUTE GRID SIZE*/
Nz = NBUFZ[0] + NBUFZ[1] + 3;

/*COMPUTE AXIS*/
let xa = Array(Nz).fill(1.0);
for(let i = 0; i < xa.length; i++)
{
	xa[i] = i*xa[i];
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
dt = nbc*dz/(2*c0);

/*COMPUTE SOURCE PARAMETERS*/
let tau = 0.5/fmax;
let t0 = 5*tau;

/*COMPUTE NUMBER OF TIME STEPS*/
let tprop = nmax*Nz*dz/c0;
let t = 2*t0 + 3*tprop;
STEPS = Math.ceil(t/dt);

/*COMPUTE THE SOURCE*/
let nz_src = Math.round(Nz/2);
t = Array(STEPS-1).fill(1.0*dt);
for(let i=0; i < t.length; i++)
{
	t[i] = i*dt;
}
let ESRC = Array(2*t.length).fill(1.0);
for(let i=0; i < ESRC.length; i+=2)
{
	/*This a complex number it could be a good idea to make this a clase*/
	ESRC[i+0] = Amplitude*Math.cos(Math.pow((t[i] - t0)/tau,2));
	ESRC[i+1] = Amplitude*Math.sin(Math.pow((t[i] - t0)/tau,2));
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
	Hx[Nz] = Hx[Nz] + mHx[Nz]*(0 - Ey[Nz])/dz;
	
	/*Dirichlet Boundary Condition for Ey*/
	Ey[0] = Ey[0] + mEy[0]*(Hx[0] - 0)/dz;
	/*Update E from H*/
	for(let nz=1; nz < Nz; nz++)
	{
		Ey[nz] = Ey[nz] + mEy[nz]*(Hx[nz] - Hx[nz-1])/dz;
	}
	
	/*Inject E source*/
	Ey[nz_src] = Ey[nz_src] + ESRC[T];
	
	T = (T + 1)%STEPS;
}

function plot(x, y, x0, y0)
{
	if(x.length != y.length)
	{
		return 0;
	}
	
	context.beginPath();
	context.moveTo(x0, y0);
	for(let i = 0; i < x.length; i++)
	{
		context.lineTo(x0 + x[i], y0 - y[i]);
		context.moveTo(x0 + x[i], y0 - y[i]);
	}
	context.strokeStyle = "#FF0000";
	context.stroke();
}

function draw()
{
	update();
		
	context.clearRect(0,0,width,height);
	plot(xa, Ey, 0, height/2);
	requestAnimationFrame(draw);
}


