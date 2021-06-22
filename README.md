## SimMapper

A tool using DruidJS, which is a JavaScript library for dimensionality reduction. 
With dimesionality reduction you can project high-dimensional data to a lower dimensionality while keeping method-specific properties of the data.
DruidJS makes it easy to project a dataset with the implemented dimensionality reduction methods.

## Building and Running

The application requires `npm` to build and run

* `npm install`

   In the root directory will install all required dependencies. The project uses `gulp` tasks to perform all steps required to build and execute the final application. The following tasks are available (you can always run `gulp --tasks` to see an overview of all avialable tasks):

* `npx gulp`

   This task builds the application from scratch. If an old build exists, it is removed before the new build is started. After the build is finished, the application is
   started automatically. Since this is the default task, it is also started if one simply runs `gulp` without a task name.

* `npx gulp clean`

    Removes any existing build artifacts.

* `npx gulp build`

    Removes existing artifacts and builds the application, but does not run it.

* `npx gulp run`

    Runs the application. The application must have been built using `gulp build` or `gulp default` before it can be run this way.

* `npx gulp app`

   Creates an executable from the application that can be run standalone. The application must have been built using `gulp build` or `gulp default` before it can be exported.



