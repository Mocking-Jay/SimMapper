<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>SimMapper</title>
    <link rel="stylesheet" href="css/index.css">
</head>
<body>
<!-- Content -->
<div class="sm-main">
    <h1 id="test">SimMapper</h1>
    <img class="sm-logo" src="img/similar.png"/>

    <div class="sm-content">
        <div class="sm-row">
            <div class="sm-col sm-col-30 sm-desc">
                SimMapper is an application using DruidJS, which is a JavaScript library for dimensionality reduction.
                With dimesionality reduction you can project high-dimensional data to a lower dimensionality while keeping method-specific properties of the data.
                DruidJS makes it easy to project a dataset with the implemented dimensionality reduction methods.
            </div>
        </div>

        <div class="sm-row">
            <div class="sm-col">
                <label for="csv_upload">CSV Upload</label>
                <input id="csv_upload" name="csv_upload" type="file"/>
            </div>
        </div>

        <div class="sm-row">
            <div class="sm-col">
                <div id="data-wrapper" class="data-table hider">

                    Data Preview
                    <div id="data-display"></div>
                    <div id="data-more" class="hider">...</div>

                    <div class="data-options">
                        <div class="data-option">
                            <label for="data-language">CSV Encoding</label>
                            <select id="data-language" name="data-language">
                                <option>UTF-8</option>
                                <option>UTF-16</option>
                            </select>
                        </div>

                        <div class="data-option">
                            <label for="data-separator">CSV Separator</label>
                            <select id="data-separator" name="data-separator">
                                <option>,</option>
                                <option>;</option>
                                <option>|</option>
                                <option>Tabulator</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="sm-row">
            <div class="sm-col">
                <button id="csv_select" name="csv_select" class="btn hider">Select CSV data</button>

                <label for="viz_add">Multi-Visualization View</label>
                <input type="checkbox" id="viz_add" name="viz_add" checked/>
            </div>
        </div>


        <div class="sm-row">
            <div class="sm-col">
                <label for="dim_method">Dimensionality Reduction Method</label>
                <select id="dim_method" name="dim_method" disabled>
                    <option value="PCA">PCA</option>
                    <option>UMAP</option>
                    <option>TSNE</option>
                    <option>TriMap</option>
                    <option>LLE</option>
                    <option>LTSA</option>
                    <option>ISOMAP</option>
                    <option>FASTMAP</option>
                    <option>MDS</option>
                    <option>LSP</option>
                    <option>LDA</option>
                    <option>TopoMap</option>
                </select>
            </div>
        </div>


        <!-- Create a div where the graph will take place -->
        <div id="data_viz" class="sm-data-viz"></div>

    </div>
</div>

<footer class="sm-footer">
    <div>IVIS 2021</div>
    <div>Jihad Itani, Piotr Kupiec, Emanuel Moser, Martin Sackl</div>
    <div>Copyright 2021 by the authors, except as otherwise noted.</div>
    <div>This work is placed under a
        Creative Commons Attribution 4.0 International (CC BY 4.0) licence
    </div>
</footer>

<!--  Bundle  -->
<script src="../simmapper.js"></script>
<script src="../data.js"></script>
</body>
</html>